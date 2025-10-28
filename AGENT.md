### Overview

The legacy application was created for educational purposes for children on the autism spectrum. The app generates visual cards based on user prompts, describing steps and topics to be taught.

For the enhanced version, I want to extend its functionality to serve as a **communication helper between parents and children with ASD**.

### Main Features

1. **Card Generation and Education**

   * Create a card based on a user prompt. The generated card can then be used to teach words and necessary steps to the child.
   * For your reference (and inspiration for better solutions):

     * The legacy app presents steps using [Remotion](https://github.com/remotion-dev/remotion).
     * To reorder steps, it uses [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd).

2. **Parent-Child Interaction**

   * Parents select a topic, and children select a card generated under one of the categories: **Topic**, **Action**, **Emotion**.
   * Some cards (e.g., "I don’t know", "Yes", "No") should be displayed at the bottom of the screen by default to facilitate responses.
   * During conversation:

     * Parents ask questions using a card and voice.
     * The child’s voice responses should be recorded to track conversation history.
     * Cards selected by the child should be stored to track which conversations have occurred.
   * This feature is inspired by the following paper: [ACM Paper](https://dl.acm.org/doi/pdf/10.1145/3706598.3713792).

### Technology Stack

* **Framework:** Next.js
* **UI:** shadcn/ui
* **Card Generation & Image Search:** Azure OpenAI API + Bing search
* **Deployment Consideration:** Avoid relying on public cloud services beyond Azure OpenAI to minimize cost and keep the app accessible.

### Important Notes

* Avoid verbose code and unnecessary error handling.
* Focus on clear, minimal, and maintainable implementation.
* Avoid create markdown files except for README.md. About techinical details and how to start the application, add it into README.md.
* Avoid to show up API key in the frontend due to the security concern.
