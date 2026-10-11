# Trail Buddy 🌿

**A pocket-sized field guide that helps you notice more outside—and spend less time looking at a screen.**

Trail Buddy is a small, responsive web app built with HTML, CSS, and JavaScript. Write down something you noticed on a walk—a bird call, a changing leaf, a patch of moss—and an open-weight language model finds the closest match in a collection of nature notes. Save the result in a journal stored in your browser.

> Trail Buddy is a learning prompt, not a scientific identification tool. It does not confirm a species or replace advice from a local expert.

## Features

- **Open-weight AI in the browser:** Uses the MiniLM sentence embedding model through Transformers.js to find semantically similar field-guide notes.
- **Private by design:** The observation is processed in the browser, not sent to an inference API. Journal entries are saved in local storage on your device.
- **No account or API key:** There is no app backend, sign-in, or paid inference service.
- **Outdoor prompts:** Includes short activities to encourage looking, listening, and exploring.
- **Responsive layout:** Works on desktop and mobile-sized screens.

## Getting started

### Requirements

- A recent browser with JavaScript modules and WebAssembly support.
- Python 3 or another simple local web server.
- An internet connection for the initial Transformers.js and model download.

### Run locally

1. Download or clone this repository.
2. Open a terminal in the `trail-buddy` project folder.
3. Start a local web server:

   ```sh
   python -m http.server 8000
   ```

4. Visit [http://localhost:8000](http://localhost:8000).
5. Enter an observation and choose **Find a match**. The first model load may take a little while.

Serve the files over HTTP instead of opening `index.html` directly, because browsers may block JavaScript modules on `file://` URLs.

## How the AI works

Trail Buddy uses [Transformers.js](https://huggingface.co/docs/transformers.js) and the [Xenova/all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2) model. The model converts the observation and each field-guide note into vectors (embeddings). JavaScript compares those vectors with cosine similarity and returns the closest note.

The model is open-weight and runs locally in the browser. This makes the project easy to inspect and adapt: developers can edit the guide notes, change the model, or change the matching behavior without maintaining an inference server. The trade-off is that the first visit downloads the library and model from public CDNs.

## Privacy and offline behavior

- Observation text and journal entries are not sent to a Trail Buddy backend; the project has no backend.
- Journal entries are stored in the browser's `localStorage`. Clearing browser site data removes them.
- The app needs internet access the first time it loads the AI library and model. Browser caching may help on later visits, but this version does **not** guarantee fully offline use.
- If the model cannot load, the app displays a message and keeps the observation on the device.

## Project files

```text
trail-buddy/
├── index.html   # Page structure and content
├── styles.css   # Visual design and responsive styles
├── app.js       # Model loading, semantic matching, and journal storage
└── README.md    # Project documentation
```

## Ideas for future work

- Add an optional installable PWA experience and carefully cache the model for offline trips.
- Let users choose their region and show locally relevant nature notes.
- Add audio recording and an open model for bird-call exploration, with clear uncertainty labels.
- Improve accessibility, keyboard navigation, and language support.

## Contributing

Ideas, bug reports, and pull requests are welcome. Keep suggestions grounded in observation, privacy, and the goal of making the screen the shortest part of an outdoor activity.

## Acknowledgments

- [Transformers.js](https://huggingface.co/docs/transformers.js) for running transformer models in JavaScript environments.
- The [Xenova/all-MiniLM-L6-v2 model](https://huggingface.co/Xenova/all-MiniLM-L6-v2) for sentence embeddings.
