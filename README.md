
# VisualGenius: Communication Assistant (WIP)

Most children with autism spectrum disorders (ASD) are visual learners. They tend to comprehend visual information better than auditory input, making visual supports more effective for their learning process.

- VisualGenius means Visual + Generative AI + Me & Us.

- What Will You Do in This Application?

  1. Vector-based image search
  1. Text to image generation (Prompt-tuning for listing up images)
  1. Image collection management

## Why did you start planning this project?

1. <b>Personal experience</b>: During my participation in a project last year, I took part in an activity involving the creation of a visual card. The activity required cutting an image from a book and covering it with a laminated sheet, which was then heated to attach it to the image. However, I found this process to be extremely time-consuming and challenging considering the final outcome.

2. <b>Market demands</b>: My team's market research revealed that the existing products in this particular niche market were both expensive and of inferior quality. It was apparent that there was an opportunity to provide a better solution for consumers.

3. <b>Democratizing AI</b>: One of the core objectives of this project is to harness the power of Generative AI and make it accessible to everyone. Before the advent of technologies like LLM (Large Language Model), performing simple sentiment analysis on customer reviews required a significant investment of time and resources, often taking up to several months to build and evaluate a model using traditional methods. However, with the introduction of ChatGPT and similar AI tools, the same features can now be developed with just a few lines of code.

## How to configure development enviroment

  Note: Please ensure you have installed <code><a href="https://nodejs.org/en/download/">nodejs</a></code>

  To preview and run the project on your device:

  1. Open project folder in <a href="https://code.visualstudio.com/download">Visual Studio Code</a>
  2. In the terminal, run `npm install`
  3. Run `npm run dev` to view project in browser

  !important: `react-beautiful-dnd` was not able to work well with `reactStrictMode: true` in NextJs.
  Turn off the option at `next.config.js`.`

## Design

### Landing Page

  <img src="docs/home.png" alt="home" width="500"/>   

### Generate and Search Page

  <img src="docs/generate.png" alt="generate" width="500"/> 

### Search Result Page

  <img src="docs/select.png" alt="select" width="500"/> 
  