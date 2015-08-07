
## DESCRIPTION:

A REST API to interface with a Rock system (http://rock-robotics.org) via http


Best used together with the "gui/rock_webapp" package (https://github.com/rock-core/gui-rock_webapp) which provides some html pages
with JavaScript controls.


## FEATURES/PROBLEMS:
Ports that provide array messages are read very slowly, this can be sped up by using the binary mode by setting the binary option
PORTURL?binary=true

The result will encode any array data types in base64 encoded arrays encapsulated in json

## Installation

In your rock installation install "tools/rest_api" for the api only or "gui/rock_webapp" for additional browser pages

## Running

Just run

    rock-webapp

The api is available on localhost:9292/api


## Syskit
If your system is using syskit, you can start webapp from a bundle and interface with syskit using

    rock-webapp --enable-syskit


# API

## Browser Addons

A JSON viewer plugin for your browser helps to evaluate the data:

* [firefox](https://addons.mozilla.org/de/firefox/addon/jsonview/)
* [chrome](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc)


## Task API URLS

### Tasks
 * The list of running tasks
  * http://localhost:9292/api/tasks/tasks

 * Complete Task information
  * http://localhost:9292/api/tasks/tasks?extended_info=true

 * Task information
  * http://localhost:9292/api/tasks/tasks/+TASKNAME
  * the task name also contains the host from the api server viewpoint (e.g. "localhost/controller/")

### Properties (only read access)
 * get property names
  * http://localhost:9292/api/tasks/tasks/+TASKNAME+/properties
 * get current values
  * http://localhost:9292/api/tasks/tasks/+TASKNAME+/properties/+PROP_NAME+/read

### Ports
 * Port information
  * http://localhost:9292/api/tasks/tasks/+TASKNAME+/ports - all ports
  * http://localhost:9292/api/tasks/tasks/+TASKNAME+/ports/+PORTNAME - specific port

 * read output ports
  * http://localhost:9292/api/tasks/tasks/+TASKNAME+/ports/+PORTNAME+/read

 * write input ports (json formatted POST data use /sample for correct json data layout)
  * http://localhost:9292/api/tasks/tasks/+TASKNAME+/ports/+PORTNAME+/write

 * get the json format for input ports
  * http://localhost:9292/api/tasks/tasks/+TASKNAME+/ports/+PORTNAME+/sample

### Use websockets to read/write ports

Ports are also available via websockets

Every time new data is available on the post, a update is automatically send
to the clients websocket, where the according callback is called.
The websocket api is includes in any modern webbroswer and is also available
for several programming languages.

### Calling Operations

Operations can be listed using:
 * http://localhost:9292/api/tasks/tasks/+TASKNAME+/operations
 * the argument json specification of the arguments can be requested:
 * http://localhost:9292/api/tasks/tasks/+TASKNAME+/operations/+OPERATION_NAME/sample

 Calling an Operation requires an POST http call submitting the arguments in an array called "args" : curl -X POST -d 'value={"args": [{"position": {"data": [1,1,0]}},"test"]}' URL

 The URL can provide an argument whether the call should block until the operation is finished or not
 * http://localhost:9292/api/tasks/tasks/+TASKNAME+/operations/+OPERATION_NAME?blocking=true


## Connect and disconnect ports

The port url is the following
* http://localhost:9292/api/tasks/tasks/+TASKNAME+/ports/+PORTNAME
it is referred here as PORT_URL

To connect ports:
 * PORT_URL/connect&to=taskname&port=portname
  * optional GET params:
    * &type=buffer (buffer|data) defalt:data
    * &size=10 (buffer size) default:10

To disconnect:
 * PORT_URL/disconnect&from=taskname&port=portname

To disconnect all:
 * PORT_URL/disconnect_all


## Control of rock-based robots using the HTTP API from a terminal

to control robots directly, you can use [CURL](http://curl.haxx.se/) (or libcurl)

### api/tasks
    curl http://localhost:9292/api/tasks/tasks/localhost/trajectory_follower/ports/motion_command/sample

  returns

    {"value":{"translation":5.081281e-316,"rotation":4.29623755e-316}}

In order write the port, we need to create a POST paramater from this JSON representation:

    value={"translation":5.081281e-316,"rotation":4.29623755e-316}

So we need this line to write the port:

    curl -X POST -d 'value={"translation":1,"rotation":1}' http://localhost:9292/api/tasks/tasks/localhost/simple_controller/ports/motion_command/write


### api/syskit

  * Request: curl http://localhost:9292/api//jobs

  * Write:   curl -X POST -H "Content-Type: application/json" -d '{"id":9}' http://localhost:9292/api/syskit/jobs/kill<br><br>


## Addons

You might want to add constom html/js control elements to use with the ui, to add them

You need to install a ruby plugin similar to [gui/rock_webapp](https://github.com/rock-core/gui-rock_webapp)


Which is then presented as localhost:9292/<NAME>/ for the browser.

### For example:

"gui/rock_webapp" maps to localhost:9292/ui/ using

     map '/ui' do
         run Rack::Directory.new( File.join( plugin_path, 'ui' ) )
    end
