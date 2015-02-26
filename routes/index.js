var router = require('express').Router(),
    package = require('../package.json');

router.get('/', function(req, res, next) {
    res.json({
        name: package.name,
        description: package.description,
        version: package.version,
        author: package.author
    });
});

module.exports = router;
