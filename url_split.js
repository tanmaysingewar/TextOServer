module.exports = function (url) {
    var splitParametersFromUrl = url.split('?');
    if (!splitParametersFromUrl[1]) {
        return [{noString : true}]
    }
    var spliteParameters = splitParametersFromUrl[1].split('&');

    var param = function (name, value) {
        this.Name = name,
            this.Value = value
    }
    var resualt = new Array();
    for (var i = 0; i < spliteParameters.length; i++) {
        var item = spliteParameters[i].split('=');
        var itemParam = new param(item[0], item[1]);
        resualt.push(itemParam);
    }

    return resualt;
}