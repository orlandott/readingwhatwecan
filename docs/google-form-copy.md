# Google Form copy for RWWC suggestions

Use this template when creating a copy of the suggestion form so the website can submit to it directly.

## Required questions

1. **Title** (Short answer, required)
2. **Author** (Short answer, required)
3. **Link** (Short answer, required)
4. **Pages** (Short answer or number, optional)
5. **Reading track** (Dropdown, required) with exact options:
   - AI safety basics
   - ML engineering & AI safety
   - ML upskilling
   - AI safety-relevant sci-fi

## Connect the copy to the website

1. Open your copied form and click **Get pre-filled link**.
2. Fill sample values, submit, and copy the generated URL.
3. Extract the `entry.<id>` values from that URL.
4. Update [`public/suggestion-form-config.js`](../public/suggestion-form-config.js) with:
   - `mode: "google_form"`
   - `googleForm.formViewUrl`
   - `googleForm.formResponseUrl`
   - each `googleForm.fields.<field>` `entry.<id>` mapping
5. Submit a pull request with only that config change.

After this, suggestions submitted from the site are written to the Google Sheet attached to that form.
