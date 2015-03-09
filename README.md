# ifttt-elasticsearch

Index all your stuff with IFTTT and Elasticsearch.


## Setup

To run this application you need a running elasticsearch instance. 

## Usage

1. Setup an [Elasticsearch](http://www.elasticsearch.org/) instance.
2. Open config/default.json an configure the hostname of your ES-instance and, if you like, the index and type of your contents.
3. Deploy this app to a public available server. 
4. Go to [IFTTT](https://ifttt.com) and configure a recipe as described [here](https://www.npmjs.com/package/express-ifttt-webhook) and use this application as endpoint.
5. For now, you're done. Depending on your configured ifttt recipes the contents will be pushed into ES. 
6. Visit your instance of this app.


## License

Copyright (c) 2015 Marco Grätsch  
Licensed under the [MIT license](LICENSE.md).


