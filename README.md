rock-webapp
===========

Ui elements for rock webapp




So ... No demo video because the laptop I have makes choppy sound :(

Anyways, it is now pushed on branches and PRs ... The relevant things you have to pull are there:

  https://gist.github.com/doudou/06af53e022064d31f5ad

In addition, you will need to pull https://github.com/rock-core/package_set/pull/8 and run autoproj osdeps to install the required dependencies.

The best way forward is IMO that you take care of the client-side HTML and javascript -- since you seem to be confident about it. Once you have something, I can integrate it in a simple sinatra app (or even pure rack) so that one can get the files served by the HTTP server directly.

I you have some troubles, please add them as comments in the relevant pull requests (there is one per branch). If you don't know from which package the problem comes, just add it there
  https://github.com/rock-core/tools-orocosrb/pull/3

Sylvain


Of course, I forgot the most important parts ,,,

To start the app, run
  rock-webapp

The default port is 9292

The API is under the tasks/ namespace and the entry points are quite self-documenting:
  https://github.com/rock-core/tools-orocosrb/blob/webapp/lib/orocos/webapp/tasks.rb

For instance,

  GET http://localhost:9292/tasks/
will list the available tasks and

  GET http://localhost:9292/tasks/localhost/camera
will return information about a 'camera' task on the localhost name service.

The representation of each returned object is documented either in typelib (the #to_h and #to_simple_value methods) or in orogen (the #to_h methods). We'll have to gather all in a single point to get a proper API documentation ...

You can stream the samples from a port by opening the entry point using a websocket instead of HTTP (using the ws:// URL instead of http:// URL)

Sylvain

