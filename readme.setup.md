# Todos
- [ ] _app styles don't seem to be applying on page reload, or when going directly to the posts/first-post.js etc

# Notes
- The "docs" top-level folder is what get's deployed to the public github pages website when this repo is pushed to main

# Installation
- https://learn.microsoft.com/en-us/windows/dev-environment/javascript/react-on-windows
- https://learn.microsoft.com/en-us/windows/dev-environment/javascript/react-on-wsl

Make sure you install Node.js from their windows installer download, on their website

"npx" is like a special kind of npm command... not really sure how it's different but it's what's recommended

```bash
npx create-react-app my-app
```

This will create the folder called "my-app" and create a react app inside of it

Next start the development server on your localhost

```base
cd my-app
npm start
```

Next, build the app and test deploying it to wherever you want (like github pages)

```bash
npm build
```

The above command will create a "build" folder in the "my-app" folder

Copy the contents of the "build" folder to the "docs" top-level folder, then commit/push

Go to this website to see if it publishes

https://github.com/onewhit/onewhit.github.io/deployments

You'll also probably want react router

```bash
npm install react-router-dom
```

---

My old react router setup was way outdated, so I switched to follow the react router tutorial which used "vite" to server the app instead of create-react-app, using this tutorial page

  - https://reactrouter.com/en/main/start/tutorial

```bash
npm create vite@latest vite-app -- --template react
cd vite-app
# npm install react-router-dom localforage match-sorter sort-by
npm install react-router-dom
npm run dev
npm run build
```

Copy out the "dist" folder to the "docs" top-level folder, then push to github

