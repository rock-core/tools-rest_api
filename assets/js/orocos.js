/** @namespace for all things related to orocos.js */
var orocos = {}

// now come a bunch of helper functions
// and configuration values defined in the namespace

/** joins the arguments to a path, e.g. ["a","b"] becomes "a/b"
*/
orocos.join_path = function() {
    return Array.prototype.slice.call(arguments).join('/');
}

/** convert the given relative path to a websocket url
 * e.g. /ws becomes ws://host/ws
 */
orocos.get_websocket_url = function( path ) {
    // for now don't use any encryption,
    // but can be added easily be checking if protocol is https
    return "ws://" + window.location.host + path
}
orocos.BASE_URL = "/api/tasks/tasks"

/** @constructor definition of the Port class
 *
 * The Port represents an interface to a port of a TaskContext.
 * It manages type information, and allows to access the port
 * Through readers and writers.
 *
 * @param {orocos.Task} task - the task, the port is connected to
 * @param {string} name - name of the port
 */
orocos.Port = function(task, name) {
    this.task = task
    this.name = name
}
/** get the url for the REST interface to the port */
orocos.Port.prototype.getURL = function() {
    return orocos.join_path( this.task.getURL(), "ports", this.name )
}

/**
 * get a writer object to the port
 * Call write on the returned object to send data to the port.
 * Data is only certain to go through once the onopen callback
 * has been called.
 */
orocos.Port.prototype.writer = function() {
    var url = orocos.get_websocket_url( this.getURL() + "/write" )
    var ws = new WebSocket( url )
    ws.write = function(msg) {
        var obj = JSON.stringify(msg)
        this.send( obj )
    }
    return ws;
}

/** get a reader object to the port
 * pass a callback to this function, which gets called with the received data
 * type. You can also set the callback as onread
 */
orocos.Port.prototype.reader = function( onread ) {
    var url = orocos.get_websocket_url( this.getURL() + "/read" )
    var ws = new WebSocket( url )
    ws.onread = onread
    ws.onmessage = function( event ) {
        var obj = JSON.parse( event.data )
        this.onread( obj )
    }
    return ws;
}

/** @constructor definition for the Task class
 *
 * The Task class represents an interface to an Orocos::TaskContext on the
 * server side. This includes managing of ports, task running states and so on.
 *
 * The most convenient way to get a Task on the localhost nameservice is
 * orocos.get("taskname")
 *
 * @param {orocos.NameService} name_service - name service class at which the
 *      task is registered
 * @param {string} name - taskname
 */
orocos.Task = function(name_service, name) {
    this.name_service = name_service
    this.name = name
}
/** get the url for the REST interface to the task */
orocos.Task.prototype.getURL = function() {
    return orocos.join_path( this.name_service.getURL(), this.name )
}
/** get a port object for the given name
* @param {string} name - name of the port
*/
orocos.Task.prototype.port = function(portname) {
    return new orocos.Port( this, portname )
}

/** @constructor definition of the NameService class
 *
 * The NameService is a mirrored version of the Orocos::NameService class.
 * It allows querying the tasks registered with the NameService and
 * retrieving of task objects.
 */
orocos.NameService = function(name) {
    this.name = name
}
/** get the url for the REST interface to the task */
orocos.NameService.prototype.getURL = function() {
    return orocos.join_path( orocos.BASE_URL, this.name )
}
/** get a Task object registered with this NameService
* @param {string} taskname - name of the task
*/
orocos.NameService.prototype.get = function( taskname ) {
    return new orocos.Task( this, taskname )
}

// register the default nameservice as localhost
orocos.name_service = new orocos.NameService("localhost")

// provide a shortcut to the default nameservice
orocos.get = function( taskname ) {
    return orocos.name_service.get( taskname )
}


