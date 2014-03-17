var base = require('borschik/lib/techs/css.js'),
    parser = require('gonzales'),
    INHERIT = require('inherit');


function modifyRuleset(ruleset, prefix, topmostClasses) {
    if(!(ruleset instanceof Array)) return;

    if(ruleset[0] == 'atruler')
        ruleset[3].forEach(function(elem){ modifyRuleset(elem, prefix, topmostClasses) });

    if(ruleset[0] != 'ruleset') return;

    ruleset[1].forEach(function(elem){ modifySelector(elem, prefix, topmostClasses) });
};

function modifySelector(selector, prefix, topmostClasses) {
    if(!Array.isArray(selector)) return;
    if(selector[0] != 'simpleselector') return;

    var selectorType = selector.shift(),
        firstPart = [],
        topmostTags = ['html', 'body'],
        preparationNeeded = true;

    while(selector[0] && preparationNeeded) {

        var elem = selector[0],
            elemType = elem[0],
            isWhitespaceOrComment = elemType == 's' && selector.length != 1 || elemType == 'comment',
            isTopmostTag = elemType == 'ident' && topmostTags.indexOf(elem[1]) != -1,
            isTopmostClass = elemType == 'clazz' && topmostClasses.indexOf(elem[1][1]) != -1;

        preparationNeeded = isWhitespaceOrComment || isTopmostTag || isTopmostClass;

        preparationNeeded && firstPart.push(selector.shift());

    }

    if(selector[0] && (selector[0][0] != 'clazz' || selector[0][1][1] != prefix)) {
        if(selector.length > 1 || selector.length == 1 && selector[0][0] != 's') {
            selector.unshift(['s', ' ']);
            selector.unshift(['clazz', ['ident', prefix]]);

            if(firstPart.length && firstPart[firstPart.length -1][0] != 's')
                selector.unshift(['s', ' ']);
        }
    }

    firstPart.length && selector.unshift.apply(selector, firstPart);

    selector.unshift(selectorType);
}

exports.addPrefix = function addPrefix(source, prefix, topmostClasses) {
    if (source === '') { return source; }
    var ast = parser.srcToCSSP(source);
    ast.map(function(elem){ modifyRuleset(elem, prefix, topmostClasses) });
    return parser.csspToSrc(ast);
};

exports.Tech = INHERIT(base.Tech, {
    File: INHERIT(base.File, {
        processInclude: function(path, content) {
            content = this.__base(path, content);
            return typeof process.env.BEM_CONFLICTS_NO === 'undefined' ?
                content :
                addPrefix(content, 'bem-' + process.env.BEM_CONFLICTS_NO, ['b-page', 'i-ua', 'page', 'ua']);
        }
    })
});
