exports.config =
  # See http://brunch.io/#documentation for docs.
  conventions:
    assets: /^app\/assets\//
  paths:
    public: 'build'
    watched: ['app']
  files:
    javascripts:
      joinTo:
       'client.js': /^app\//
       'server.js' : /^app\/server/
    stylesheets:
      joinTo: 'app.css'
    templates:
      joinTo: 'app.js'