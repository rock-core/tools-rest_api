= rock-webapp

== DESCRIPTION:

A REST API and in-browser UI to interface with a Rock system


== FEATURES/PROBLEMS:
Ports that provide bit messages are read very slowly, this can be sped up by usding the binary mode by setting the binary option
PORTURL?binary=true 


== Running

Just run

```
rock-webapp
```

And open localhost:9292 in a browser (further api information there)


== Syskit
If your system is using syskit, you can start webapp from a bundle and interface with syskit using

```
rock-webapp --enable-syskit
```


= Addons

You might want to add constom html/js control elements to use with the ui, to add them, you can set the 

ROCK_WEBAPP_CUSTOM_PATH

Environment variable to a folder, which is then presentes as localhost:9292/ui/addon/ for the browser.


= Folder structure

rock/webapp/ -- main folder with grape initialization of subfolders 
rock/webapp/syskit -- syskit related ruby code (server side)
rock/webapp/tasks -- rock components related ruby code (server side)
rock/webapp/ui -- html/js user interface

rock/webapp/ui/css -- common css styles
rock/webapp/ui/js -- common JavaScript libraries
rock/webapp/ui/syskit/ -- syskit related html
rock/webapp/ui/syskit/js -- syskit related JavaScript libraries
rock/webapp/ui/tasks/ -- rock components related html
rock/webapp/ui/tasks/js -- rock components related JavaScript libraries
rock/webapp/ui/tasks/js/api -- rock components JavaScript API
rock/webapp/ui/tasks/js/gui -- rock JavaScript GUI elements (js)

