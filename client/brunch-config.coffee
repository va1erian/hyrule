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
  plugins:
   jshint:
      pattern: /^app[\\\/].*\.js$/ # matches any js files under the app/ dir
      options:
         bitwise: true
         curly: true
         esversion: 6
      warnOnly: true
