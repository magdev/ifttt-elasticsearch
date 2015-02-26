# ifttt-elasticsearch


Index all your stuff with IFTTT and Elasticsearch.

**WARNING: This prototype is not ready for production use due to the lack of any security features! It's just an experimental developer version!**

## Usage

1. Setup an [Elasticsearch](http://www.elasticsearch.org/) instance.
2. Open config/default.json an configure the hostname of your ES-instance and, if you like, the index and type of your contents.
3. Deploy this app to a public available server. (I personally use an OpenShift instance)
4. Go to [IFTTT](https://ifttt.com) and configure a recipe as described [here](https://www.npmjs.com/package/express-ifttt-webhook) and use this application as endpoint.
5. For now, you're done. Depending on your configured ifttt recipes the contents will be pushed into ES. You can use the dedicated tools, i.e. mobz/elasticsearch-head, to check your contents.


## To Do

- Security, Security, Security!
- Add a web-frontend.
- Make this app a real thing.


## License

Copyright (c) 2015 Marco Grätsch  
Licensed under the [MIT license](LICENSE.md).


