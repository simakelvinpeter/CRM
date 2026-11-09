import { team } from "../data.js";

export default function StudentForm({ onSave, onCancel }) {
  function handleSubmit(event) {
    // Stop the browser from reloading the page when this form is submitted.
    event.preventDefault();
    // FormData reads each input by its name attribute.
    const formValues = Object.fromEntries(new FormData(event.currentTarget));
    onSave({
      ...formValues,
      id: `SG-${crypto.randomUUID().slice(0, 8)}`,
      budget: Number(formValues.budget),
      stage: "Enquiry",
      nextAction: "Arrange first counselling session",
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="form-intro">
        Start with the essentials. We can add academic records and documents
        later.
      </p>
      <div className="form-grid">
        <label>
          Full name *
          <input
            autoComplete="name"
            name="name"
            required
            placeholder="e.g. Amina Hassan"
          />
        </label>
        <label>
          Email *
          <input
            type="email"
            autoComplete="email"
            name="email"
            required
            placeholder="name@example.com"
          />
        </label>
        <label>
          Preferred destination
          <select name="country">
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>Ireland</option>
            <option>USA</option>
            <option>Germany</option>
            <option>UAE</option>
          </select>
        </label>
        <label>
          Intended subject *
          <input
            name="subject"
            required
            placeholder="e.g. Business analytics"
          />
        </label>
        <label>
          Annual tuition budget (USD) *
          <input name="budget" type="number" min="0" max="1000000" required />
        </label>
        <label>
          Intake
          <select name="intake">
            <option>Sep 2027</option>
            <option>Feb 2028</option>
          </select>
        </label>
        <label>
          Assigned counsellor
          <select name="counsellor">
            {team.map((member) => (
              <option key={member.name}>{member.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="dialog-actions">
        <button className="button" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" type="submit">
          Add student
        </button>
      </div>
    </form>
  );
}
