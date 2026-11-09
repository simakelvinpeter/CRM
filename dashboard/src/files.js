// Attachments stay in IndexedDB on this computer, separate from record metadata.
const DB_NAME = "study-go-attachments-v2";
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("files", { keyPath: "id" });
    request.onerror = () =>
      reject(Error("Attachment storage is unavailable in this browser."));
    request.onsuccess = () => resolve(request.result);
  });
}
async function transaction(mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", mode),
      store = tx.objectStore("files");
    let result;
    try {
      const request = operation(store);
      if (request) request.onsuccess = () => (result = request.result);
    } catch (error) {
      db.close();
      reject(error);
      return;
    }
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(
        Error("Could not save/read attachments. Browser storage may be full."),
      );
    };
    tx.onabort = tx.onerror;
  });
}
export async function saveFile(file) {
  if (!file) return "";
  if (file.size > 10 * 1024 * 1024)
    throw Error("Maximum attachment size is 10 MB.");
  if (!/\.(pdf|png|jpe?g|webp|docx|xlsx|txt|csv)$/i.test(file.name))
    throw Error("Use PDF, image, DOCX, XLSX, TXT or CSV files.");
  const id = crypto.randomUUID();
  await transaction("readwrite", (store) =>
    store.put({ id, name: file.name, blob: file }),
  );
  return id;
}
export const removeFile = (id) =>
  transaction("readwrite", (store) => store.delete(id));
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadFile(id) {
  const file = await transaction("readonly", (store) => store.get(id));
  if (!file)
    throw Error(
      "Attachment is missing. Restore a backup containing files, or attach it again.",
    );
  downloadBlob(file.blob, file.name);
}
export async function exportBackup(data) {
  const ids = new Set(
    [...data.documents, ...data.agreements]
      .map((x) => x.fileId)
      .filter(Boolean),
  );
  const files = [];
  for (const id of ids) {
    const file = await transaction("readonly", (store) => store.get(id));
    if (!file)
      throw Error(
        "One attachment is missing; reattach it before creating a complete backup.",
      );
    const encoded = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file.blob);
    });
    files.push({ id, name: file.name, encoded });
  }
  downloadBlob(
    new Blob(
      [
        JSON.stringify({
          format: "study-go-backup",
          exported: new Date().toISOString(),
          data,
          files,
        }),
      ],
      { type: "application/json" },
    ),
    "study-go-backup-" + new Date().toISOString().slice(0, 10) + ".json",
  );
}
export async function restoreAttachments(backup) {
  const ids = new Set(
    [...backup.data.documents, ...backup.data.agreements]
      .map((x) => x.fileId)
      .filter(Boolean),
  );
  const files = backup.files || [];
  for (const id of ids)
    if (!files.some((f) => f.id === id))
      throw Error("Backup is missing an attachment.");
  const decoded = files.map((f) => {
    if (
      typeof f.id !== "string" ||
      typeof f.name !== "string" ||
      !/^data:[^,]*;base64,/.test(f.encoded)
    )
      throw Error("Invalid backup attachment.");
    const bytes = Uint8Array.from(atob(f.encoded.split(",")[1]), (c) =>
      c.charCodeAt(0),
    );
    if (bytes.length > 10 * 1024 * 1024)
      throw Error("Backup attachment exceeds 10 MB.");
    return {
      id: f.id,
      name: f.name,
      blob: new Blob([bytes], { type: "application/octet-stream" }),
    };
  });
  await transaction("readwrite", (store) => {
    decoded.forEach((f) => store.put(f));
  });
}
