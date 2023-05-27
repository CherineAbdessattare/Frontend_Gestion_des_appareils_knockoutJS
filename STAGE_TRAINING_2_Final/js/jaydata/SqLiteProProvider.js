// JayData 1.5.11 Pro - Commercial License
// Copyright JayStack Technologies (http://jaydata.org/licensing)
// Support: http://jaystack.com
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define("jaydata/sqlite-pro",["jaydata/core"],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.$data = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.DbCommand', null, null, {
    connection: {},
    parameters: {},
    execute: function execute(callback) {
        _core.Guard.raise("Pure class");
    }
}, null);

},{"jaydata/core":"jaydata/core"}],2:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.DbConnection', null, null, {
    connectionParams: {},
    database: {},
    isOpen: function isOpen() {
        _core.Guard.raise("Pure class");
    },
    open: function open() {
        _core.Guard.raise("Pure class");
    },
    close: function close() {
        _core.Guard.raise("Pure class");
    },
    createCommand: function createCommand() {
        _core.Guard.raise("Pure class");
    }
}, null);

},{"jaydata/core":"jaydata/core"}],3:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.jayStorageClient.JayStorageCommand', _core2.default.dbClient.DbCommand, null, {
    constructor: function constructor(con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function executeNonQuery(callback) {
        // TODO
        callback = _core2.default.PromiseHandlerBase.createCallbackSettings(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    executeQuery: function executeQuery(callback) {
        callback = _core2.default.PromiseHandlerBase.createCallbackSettings(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    exec: function exec(query, parameters, callback, errorhandler) {
        if (parameters == null || parameters == undefined) {
            parameters = {};
        }
        var single = false;
        if (!(query instanceof Array)) {
            single = true;
            query = [query];
            parameters = [parameters];
        }

        var provider = this;
        var results = [];
        var remainingCommands = query.length;
        var decClb = function decClb() {
            if (--remainingCommands == 0) {
                callback(single ? results[0] : results);
            }
        };

        query.forEach(function (q, i) {
            if (q) {
                _core2.default.ajax({
                    url: 'http' + (this.connection.connectionParams.storage.ssl ? 's' : '') + '://' + this.connection.connectionParams.storage.src.replace('http://', '').replace('https://', '') + '?db=' + this.connection.connectionParams.storage.key,
                    type: 'POST',
                    headers: {
                        'X-PINGOTHER': 'pingpong'
                    },
                    data: { query: q, parameters: parameters[i] },
                    dataType: 'json',
                    contentType: 'application/json;charset=UTF-8',
                    success: function success(data) {
                        if (data && data.error) {
                            console.log('JayStorage error', data.error);
                            errorhandler(data.error);
                            return;
                        }
                        if (this.lastID) {
                            results[i] = { insertId: this.lastID, rows: (data || { rows: [] }).rows };
                        } else results[i] = { rows: (data || { rows: [] }).rows };
                        decClb();
                    }
                });
            } else {
                results[i] = null;
                decClb();
            }
        }, this);
    }
}, null);

},{"jaydata/core":"jaydata/core"}],4:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.jayStorageClient.JayStorageConnection', _core2.default.dbClient.DbConnection, null, {
    constructor: function constructor(params) {
        this.connectionParams = params;
    },
    isOpen: function isOpen() {
        return true;
        //return this.database !== null && this.database !== undefined;
    },
    open: function open() {
        /*if (this.database == null) {
            var p = this.connectionParams;
            this.database = new sqLiteModule.Database(p.fileName);
        }*/
    },
    close: function close() {
        //not supported yet (performance issue)
    },
    createCommand: function createCommand(queryStr, params) {
        var cmd = new _core2.default.dbClient.jayStorageClient.JayStorageCommand(this, queryStr, params);
        return cmd;
    }
}, null);

},{"jaydata/core":"jaydata/core"}],5:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.openDatabaseClient.OpenDbCommand', _core2.default.dbClient.DbCommand, null, {
    constructor: function constructor(con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function executeNonQuery(callback, tran, isWrite) {
        callback = _core2.default.PromiseHandlerBase.createCallbackSettings(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error, tran, isWrite);
    },
    executeQuery: function executeQuery(callback, tran, isWrite) {
        callback = _core2.default.PromiseHandlerBase.createCallbackSettings(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error, tran, isWrite);
    },
    exec: function exec(query, parameters, callback, errorhandler, transaction, isWrite) {
        // suspicious code
        /*if (console) {
            //console.log(query);
        }*/
        this.connection.open({
            error: errorhandler,
            success: function success(tran) {
                var single = false;
                if (!(query instanceof Array)) {
                    single = true;
                    query = [query];
                    parameters = [parameters];
                }

                var results = [];
                var remainingCommands = 0;

                function decClb() {
                    if (--remainingCommands == 0) {
                        callback(single ? results[0] : results, transaction);
                    }
                }

                query.forEach(function (q, i) {
                    remainingCommands++;
                    if (q) {
                        tran.executeSql(query[i], parameters[i], function (trx, result) {
                            var r = { rows: [] };
                            try {
                                r.insertId = result.insertId;
                            } catch (e) {}
                            if (typeof r.insertId !== 'number') {
                                // If insertId is present, no rows are returned
                                r.rowsAffected = result.rowsAffected;
                                var maxItem = result.rows.length;
                                for (var j = 0; j < maxItem; j++) {
                                    r.rows.push(result.rows.item(j));
                                }
                            }
                            results[i] = r;
                            decClb(trx);
                        }, function (trx, err) {
                            var _q = q;
                            var _i = i;

                            if (errorhandler) errorhandler(err);

                            return true;
                        });
                    } else {
                        results[i] = null;
                        decClb();
                    }
                });
            }
        }, transaction, isWrite);
    }
}, null);

},{"jaydata/core":"jaydata/core"}],6:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.openDatabaseClient.OpenDbConnection', _core2.default.dbClient.DbConnection, null, {
    constructor: function constructor(params) {
        this.connectionParams = params;
    },
    isOpen: function isOpen() {
        return this.database !== null && this.database !== undefined && this.transaction !== null && this.transaction !== undefined;
    },
    open: function open(callBack, tran, isWrite) {
        if (isWrite === undefined) isWrite = true;

        callBack.oncomplete = callBack.oncomplete || function () {};
        if (tran) {
            callBack.success(tran.transaction);
        } else if (this.database) {
            if (isWrite) {
                this.database.transaction(function (tran) {
                    callBack.success(tran);
                }, callBack.error, callBack.oncomplete);
            } else {
                this.database.readTransaction(function (tran) {
                    callBack.success(tran);
                }, callBack.error, callBack.oncomplete);
            }
        } else {
            var p = this.connectionParams;
            var con = this;
            this.database = openDatabase(p.fileName, p.version, p.displayName, p.maxSize);
            if (!this.database.readTransaction) {
                this.database.readTransaction = function () {
                    con.database.transaction.apply(con.database, arguments);
                };
            }

            if (isWrite) {
                this.database.transaction(function (tran) {
                    callBack.success(tran);
                }, callBack.error, callBack.oncomplete);
            } else {
                this.database.readTransaction(function (tran) {
                    callBack.success(tran);
                }, callBack.error, callBack.oncomplete);
            }
        }
    },
    close: function close() {
        this.transaction = undefined;
        this.database = undefined;
    },
    createCommand: function createCommand(queryStr, params) {
        var cmd = new _core2.default.dbClient.openDatabaseClient.OpenDbCommand(this, queryStr, params);
        return cmd;
    }
}, null);

},{"jaydata/core":"jaydata/core"}],7:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.sqLiteNJClient.SqLiteNjCommand', _core2.default.dbClient.DbCommand, null, {
    constructor: function constructor(con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function executeNonQuery(callback) {
        // TODO
        callback = _core2.default.PromiseHandlerBase.createCallbackSettings(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    executeQuery: function executeQuery(callback) {
        callback = _core2.default.PromiseHandlerBase.createCallbackSettings(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    exec: function exec(query, parameters, callback, errorhandler) {
        if (!this.connection.isOpen()) {
            this.connection.open();
        }
        if (parameters == null || parameters == undefined) {
            parameters = {};
        }
        var single = false;
        if (!(query instanceof Array)) {
            single = true;
            query = [query];
            parameters = [parameters];
        }

        var provider = this;
        var results = [];
        var remainingCommands = 0;
        var decClb = function decClb() {
            if (--remainingCommands == 0) {
                provider.connection.database.exec('COMMIT');
                callback(single ? results[0] : results);
            }
        };
        provider.connection.database.exec('BEGIN');
        query.forEach(function (q, i) {
            remainingCommands++;
            if (q) {
                var sqlClb = function sqlClb(error, rows) {
                    if (error != null) {
                        errorhandler(error);
                        return;
                    }
                    if (this.lastID) {
                        results[i] = { insertId: this.lastID, rows: [] };
                    } else {
                        results[i] = { rows: rows };
                    }
                    decClb();
                };

                var stmt = provider.connection.database.prepare(q, parameters[i]);
                if (q.indexOf('SELECT') == 0) {
                    stmt.all(sqlClb);
                } else {
                    stmt.run(sqlClb);
                }
                stmt.finalize();
            } else {
                results[i] = null;
                decClb();
            }
        }, this);
    }
}, null);

},{"jaydata/core":"jaydata/core"}],8:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.dbClient.sqLiteNJClient.SqLiteNjConnection', _core2.default.dbClient.DbConnection, null, {
    constructor: function constructor(params) {
        this.connectionParams = params;
    },
    isOpen: function isOpen() {
        return this.database !== null && this.database !== undefined;
    },
    open: function open() {
        if (this.database == null) {
            var p = this.connectionParams;
            this.database = new sqLiteModule.Database(p.fileName);
        }
    },
    close: function close() {
        //not supported yet (performance issue)
    },
    createCommand: function createCommand(queryStr, params) {
        var cmd = new _core2.default.dbClient.sqLiteNJClient.SqLiteNjCommand(this, queryStr, params);
        return cmd;
    }
}, null);

},{"jaydata/core":"jaydata/core"}],9:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.sqLitePro.sqLite_ModelBinderCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor(query, context) {
        this._query = query;
        this.sqlContext = context;
        this._sqlBuilder = _core2.default.sqLitePro.SqlBuilder.create(context.sets, context.entityContext);
    },
    VisitSingleExpression: function VisitSingleExpression(expression) {
        this._defaultModelBinder(expression);
    },
    VisitFindExpression: function VisitFindExpression(expression) {
        this._defaultModelBinder(expression);
    },
    VisitSomeExpression: function VisitSomeExpression(expression) {
        this._defaultModelBinder(expression);
    },
    VisitEveryExpression: function VisitEveryExpression(expression) {
        this._defaultModelBinder(expression);
    },
    VisitToArrayExpression: function VisitToArrayExpression(expression) {
        this._defaultModelBinder(expression);
    },
    VisitFirstExpression: function VisitFirstExpression(expression) {
        this._defaultModelBinder(expression);
    },
    VisitForEachExpression: function VisitForEachExpression(expression) {
        this._defaultModelBinder(expression);
    },
    VisitCountExpression: function VisitCountExpression(expression) {
        var builder = _core.Container.createqueryBuilder();

        builder.modelBinderConfig['$type'] = _core2.default.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = _core2.default.Integer;
        builder.modelBinderConfig['$source'] = 'cnt';
        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    VisitBatchDeleteExpression: function VisitBatchDeleteExpression(expression) {
        var builder = _core.Container.createqueryBuilder();

        builder.modelBinderConfig['$type'] = _core2.default.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = _core2.default.Integer;
        builder.modelBinderConfig['$source'] = 'cnt';
        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    VisitExpression: function VisitExpression(expression, builder) {
        var projVisitor = _core.Container.createFindProjectionVisitor();
        projVisitor.Visit(expression);

        if (projVisitor.projectionExpression) {
            this.Visit(projVisitor.projectionExpression, builder);
        } else {
            this.DefaultSelection(builder);
        }
    },
    _defaultModelBinder: function _defaultModelBinder(expression) {
        var builder = _core.Container.createqueryBuilder();
        builder.modelBinderConfig['$type'] = _core2.default.Array;
        builder.modelBinderConfig['$item'] = {};
        builder.selectModelBinderProperty('$item');

        this.VisitExpression(expression, builder);

        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    _addPropertyToModelBinderConfig: function _addPropertyToModelBinderConfig(elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        elementType.memberDefinitions.getPublicMappedProperties().forEach(function (prop) {
            if (!storageModel || storageModel && !storageModel.Associations[prop.name] && !storageModel.ComplexTypes[prop.name]) {
                if (prop.key) {
                    if (this.currentObjectFieldName) {
                        builder.addKeyField(this.currentObjectFieldName + '__' + prop.name);
                    } else {
                        builder.addKeyField(prop.name);
                    }
                }
                if (this.currentObjectFieldName) {
                    builder.modelBinderConfig[prop.name] = this.currentObjectFieldName + '__' + prop.name;
                } else {
                    builder.modelBinderConfig[prop.name] = prop.name;
                }
            }
        }, this);
        if (storageModel) {
            this._addComplexTypeProperties(storageModel.ComplexTypes, builder);
        }
    },
    _addComplexTypeProperties: function _addComplexTypeProperties(complexTypes, builder) {
        complexTypes.forEach(function (ct) {

            builder.selectModelBinderProperty(ct.FromPropertyName);
            builder.modelBinderConfig['$type'] = ct.ToType;
            var tmpPrefix = this.currentObjectFieldName;
            if (this.currentObjectFieldName) {
                this.currentObjectFieldName += '__';
            } else {
                this.currentObjectFieldName = '';
            }
            this.currentObjectFieldName += ct.FromPropertyName;
            //recursion
            this._addPropertyToModelBinderConfig(ct.ToType, builder);
            //reset model binder property
            builder.popModelBinderProperty();
            this.currentObjectFieldName = tmpPrefix;
        }, this);
    },
    DefaultSelection: function DefaultSelection(builder) {
        //no projection, get all item from entitySet
        builder.modelBinderConfig['$type'] = this._query.defaultType;
        var storageModel = this._query.context._storageModel.getStorageModel(this._query.defaultType);

        var needPrefix = this.sqlContext.infos.filter(function (i) {
            return i.IsMapped;
        }).length > 1;
        if (needPrefix) {
            this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(this.sqlContext.sets[0]);
        }
        this._addPropertyToModelBinderConfig(this._query.defaultType, builder);
        this.sqlContext.infos.forEach(function (info, infoIndex) {
            if (infoIndex > 0 && info.IsMapped) {
                var pathFragments = info.NavigationPath.split('.');
                pathFragments.shift();
                var popCnt = 0;
                pathFragments.forEach(function (pathFragment, index) {
                    if (!pathFragment) {
                        return;
                    }
                    if (!builder.modelBinderConfig[pathFragment]) {
                        builder.selectModelBinderProperty(pathFragment);
                        if (info.Association.associationInfo.ToMultiplicity === '*' && pathFragments.length - 1 === index) {
                            builder.modelBinderConfig['$type'] = _core2.default.Array;
                            builder.selectModelBinderProperty('$item');
                            popCnt++;
                        }

                        builder.modelBinderConfig['$type'] = this.sqlContext.sets[infoIndex].elementType;
                        this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(this.sqlContext.sets[infoIndex]);
                        this._addPropertyToModelBinderConfig(this.sqlContext.sets[infoIndex].elementType, builder);
                        while (popCnt && popCnt--) {
                            builder.popModelBinderProperty();
                        }
                    } else {
                        builder.selectModelBinderProperty(pathFragment);
                        if (builder.modelBinderConfig.$type == _core2.default.Array) {
                            builder.selectModelBinderProperty('$item');
                            popCnt++;
                        }
                    }
                }, this);
                for (var i = 0; i < pathFragments.length; i++) {
                    builder.popModelBinderProperty();
                }
            }
        }, this);
    },
    VisitProjectionExpression: function VisitProjectionExpression(expression, builder) {
        this.hasProjection = true;
        this.Visit(expression.selector, builder);

        if (expression.selector && expression.selector.expression instanceof _core2.default.Expressions.ObjectLiteralExpression) {
            builder.modelBinderConfig['$type'] = expression.projectionAs || builder.modelBinderConfig['$type'] || _core2.default.Object;
        }
    },
    VisitParametricQueryExpression: function VisitParametricQueryExpression(expression, builder) {
        if (expression.expression instanceof _core2.default.Expressions.EntityExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
            builder.modelBinderConfig['$keys'].unshift('rowid$$');
        } else if (expression.expression instanceof _core2.default.Expressions.EntitySetExpression) {
            this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(expression.expression);
            this.VisitEntitySetAsProjection(expression.expression, builder);
            builder.modelBinderConfig['$keys'] = ['rowid$$'];
        } else if (expression.expression instanceof _core2.default.Expressions.ComplexTypeExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else {
            builder.modelBinderConfig['$keys'] = ['rowid$$'];
            this.Visit(expression.expression, builder);
            if (expression.expression instanceof _core2.default.Expressions.ConstantExpression || expression.expression instanceof _core2.default.Expressions.SimpleBinaryExpression || expression.expression instanceof _core2.default.Expressions.EntityFieldExpression || expression.expression instanceof _core2.default.Expressions.EntityFieldOperationExpression) {
                builder.modelBinderConfig['$source'] = 'd';
            }
        }
    },
    VisitConstantExpression: function VisitConstantExpression(expression, builder) {
        builder.modelBinderConfig['$type'] = expression.type;
        builder.modelBinderConfig['$source'] = this.currentObjectFieldName;
    },
    VisitEntityAsProjection: function VisitEntityAsProjection(expression, builder) {
        this.Visit(expression.source, builder);
        builder.modelBinderConfig['$type'] = expression.entityType;
        this._addPropertyToModelBinderConfig(expression.entityType, builder);
    },
    VisitEntitySetAsProjection: function VisitEntitySetAsProjection(expression, builder) {
        builder.modelBinderConfig['$type'] = _core2.default.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = expression.elementType;
        this._addPropertyToModelBinderConfig(expression.elementType, builder);
        builder.popModelBinderProperty();
    },
    VisitComplexTypeExpression: function VisitComplexTypeExpression(expression, builder) {
        return expression;
    },
    VisitEntityFieldExpression: function VisitEntityFieldExpression(expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);
    },
    VisitEntityFieldOperationExpression: function VisitEntityFieldOperationExpression(expression, builder) {
        this.Visit(expression.source, builder);
        if (expression.operation.memberDefinition.returnType) builder.modelBinderConfig['$type'] = expression.operation.memberDefinition.returnType;
    },
    VisitMemberInfoExpression: function VisitMemberInfoExpression(expression, builder) {
        if (expression.memberDefinition instanceof _core2.default.MemberDefinition) {
            builder.modelBinderConfig['$type'] = expression.memberDefinition.type;
            if (expression.memberDefinition.storageModel && expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
                this._addPropertyToModelBinderConfig(_core.Container.resolveType(expression.memberDefinition.type), builder);
            } else {
                builder.modelBinderConfig['$source'] = this.currentObjectFieldName;
            }
        }
    },
    VisitEntitySetExpression: function VisitEntitySetExpression(expression, builder) {
        if (expression.source instanceof _core2.default.Expressions.EntityExpression) {
            this.Visit(expression.source, builder);
            this.Visit(expression.selector, builder);
        }
    },
    VisitEntityExpression: function VisitEntityExpression(expression, builder) {
        this.Visit(expression.source, builder);
    },
    VisitAssociationInfoExpression: function VisitAssociationInfoExpression(expression, builder) {
        if ('$selector' in builder.modelBinderConfig && builder.modelBinderConfig.$selector.length > 0) {
            builder.modelBinderConfig.$selector += '.';
        } else {
            builder.modelBinderConfig['$selector'] = 'json:';
        }
        builder.modelBinderConfig['$selector'] += expression.associationInfo.FromPropertyName;
    },
    VisitSimpleBinaryExpression: function VisitSimpleBinaryExpression(expression, builder) {
        this.Visit(expression.left, builder);
        this.Visit(expression.right, builder);
    },
    VisitObjectLiteralExpression: function VisitObjectLiteralExpression(expression, builder) {
        builder.modelBinderConfig['$type'] = _core2.default.Object;
        expression.members.forEach(function (of) {
            this.Visit(of, builder);
        }, this);
    },
    VisitObjectFieldExpression: function VisitObjectFieldExpression(expression, builder) {
        var tempFieldName = this.currentObjectFieldName;
        builder.selectModelBinderProperty(expression.fieldName);
        if (this.currentObjectFieldName) {
            this.currentObjectFieldName += '__';
        } else {
            this.currentObjectFieldName = '';
        }
        this.currentObjectFieldName += expression.fieldName;

        if (expression.expression instanceof _core2.default.Expressions.EntityExpression || expression.expression instanceof _core2.default.Expressions.ComplexTypeExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else if (expression.expression instanceof _core2.default.Expressions.EntitySetExpression) {
            this.VisitEntitySetAsProjection(expression.expression, builder);
        } else {
            this.Visit(expression.expression, builder);
        }

        this.currentObjectFieldName = tempFieldName;

        builder.popModelBinderProperty();
    }
});

},{"jaydata/core":"jaydata/core"}],10:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SqlStatementBlocks = undefined;

var _core = _dereq_("jaydata/core");

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SqlStatementBlocks = exports.SqlStatementBlocks = {
    beginGroup: "(",
    endGroup: ")",
    nameSeparator: ".",
    valueSeparator: ", ",
    select: "SELECT ",
    where: " WHERE ",
    from: " FROM ",
    distinct: "DISTINCT ",
    skip: " OFFSET ",
    take: " LIMIT ",
    parameter: "?",
    order: " ORDER BY ",
    group: " GROUP BY ",
    as: " AS ",
    scalarFieldName: 'd',
    rowIdName: 'rowid$$',
    count: 'select count(*) cnt from (',

    NULLValue: "NULL",
    asc: ' ASC',
    desc: ' DESC',
    collate_nocase: ' COLLATE NOCASE'
};
(0, _core.$C)('$data.sqLitePro.SqlBuilder', _core2.default.queryBuilder, null, {
    constructor: function constructor(sets, context) {
        this.sets = sets;
        this.entityContext = context;
    },
    getExpressionAlias: function getExpressionAlias(setExpression) {
        var idx = this.sets.indexOf(setExpression);
        if (idx == -1) {
            var set = this.sets.find(function (it) {
                return it.storageModel == setExpression.storageModel;
            });
            if (!set) {
                idx = this.sets.push(setExpression) - 1;
            } else idx = this.sets.indexOf(set);
        }
        return "T" + idx;
    }
});

(0, _core.$C)('$data.sqLitePro.SqlCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor(queryExpression, context) {
        this.queryExpression = queryExpression;
        this.sets = context.sets;
        this.infos = context.infos;
        this.entityContext = context.entityContext;
        this.associations = [];
        this.filters = [];
        this.newFilters = {};
        this.sortedFilterPart = ['delete', 'projection', 'from', 'filter', 'group', 'order', 'take', 'skip'];
    },
    compile: function compile() {
        var sqlBuilder = _core2.default.sqLitePro.SqlBuilder.create(this.sets, this.entityContext);
        this.Visit(this.queryExpression, sqlBuilder);

        if (sqlBuilder.getTextPart('projection') === undefined && !sqlBuilder.getTextPart("delete")) {
            this.VisitDefaultProjection(sqlBuilder);
        }
        if (Array.isArray(this.frameOperationOrderBys)) {
            var compiler = this;
            this.frameOperationOrderBys.forEach(function (expression) {
                compiler.VisitOrderExpression(expression, sqlBuilder, true);
            });
        }
        var order = sqlBuilder.getTextPart("order");
        var skip = sqlBuilder.getTextPart("skip");
        var take = sqlBuilder.getTextPart("take");
        var group = sqlBuilder.getTextPart("group");
        sqlBuilder.selectTextPart("result");
        this.sortedFilterPart.forEach(function (part) {
            if (sqlBuilder.sets.length > 1 && ((skip || take || group) && part == "order" || part == "take" || part == "skip" || part == "group")) return;
            var part = sqlBuilder.getTextPart(part);
            if (part) {
                sqlBuilder.addText(part.text);
                sqlBuilder.selectedFragment.params = sqlBuilder.selectedFragment.params.concat(part.params);
            }
        }, this);
        var countPart = sqlBuilder.getTextPart('count');
        if (countPart !== undefined) {
            sqlBuilder.selectedFragment.text = countPart.text + sqlBuilder.selectedFragment.text;
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
            sqlBuilder.selectedFragment.params = sqlBuilder.selectedFragment.params.concat(countPart.params);
        }
        sqlBuilder.resetModelBinderProperty();
        var result = sqlBuilder.getTextPart("result");
        var inlinecountQuery = result.text;
        if (sqlBuilder.sets.length > 1 && (skip || take || group)) {
            var sql = result;
            var t0 = inlinecountQuery = sql.text.replace(new RegExp("SELECT (.*?) FROM " + sqlBuilder.pagingExpressionTable), "SELECT [T0].[rowid], * FROM " + sqlBuilder.pagingExpressionTable);
            var t0fields = [];
            sql.text.replace(new RegExp("\\sT0\\.(.*?)(\\s|,|\\))", "g"), function (m, member, sep) {
                var field = "T0." + member;
                if (t0fields.indexOf(field) < 0) t0fields.push(field);
            });
            if (t0fields.length > 0) {
                var params = sql.params.slice();
                var sqlReplace = "FROM (" + t0 + " GROUP BY " + t0fields.join(", ");
                if (this.infos.filter(function (it) {
                    return it.Association && it.Association.associationInfo.FromType.memberDefinitions.getMember(it.Association.associationInfo.FromPropertyName).type == Array;
                }).length > 0) {
                    inlinecountQuery += " GROUP BY " + t0fields.join(", ");
                }
                if (order) {
                    sqlReplace += order.text;
                    if (order.params && order.params.length > 0) params = params.concat(order.params);
                }
                if (take) {
                    sqlReplace += take.text;
                    params.push(take.params[0]);
                }
                if (skip) {
                    sqlReplace += skip.text;
                    params.push(skip.params[0]);
                }
                sqlReplace += ")";
                sql.text = sql.text.replace("FROM " + sqlBuilder.pagingExpressionTable, sqlReplace);
                sql.params = params.concat(sql.params);
            } else {
                if (take) {
                    sql.text += take.text;
                    sql.params = sql.params.concat(take.params);
                }
                if (skip) {
                    sql.text += skip.text;
                    sql.params = sql.params.concat(skip.params);
                }
            }

            if (group) {
                inlinecountQuery += group.text;
                sql.text += group.text;
                if (group.params && group.params.length > 0) params = params.concat(group.params);
            }

            if (order) {
                sql.text += order.text;
                if (order.params && order.params.length > 0) sql.params = sql.params.concat(order.params);
            }
        }
        var inlinecount = sqlBuilder.getTextPart("inlinecount");
        if (inlinecount) {
            this.withInlineCount = true;
            var sql = result;
            var params = [];
            var i = 0;
            inlinecountQuery.replace(new RegExp("\\?", "g"), function (m, member, sep) {
                if (sep.slice(member - 6).slice(0, 5) != "LIMIT" && sep.slice(member - 7).slice(0, 6) != "OFFSET") {
                    params.push(sql.params[i]);
                }
                i++;
            });
            inlinecountQuery = inlinecountQuery.replace("LIMIT ?", "").replace("OFFSET ?", "").replace(new RegExp(group ? group.text : "" + "$"), "");
            if (inlinecountQuery.indexOf("SELECT DISTINCT") < 0) {
                inlinecountQuery = inlinecountQuery.replace(/^SELECT (.*?) FROM/, "SELECT 1 FROM");
            }
            sql.text = sql.text.replace(new RegExp("^SELECT"), "SELECT (" + inlinecount.text + " (" + inlinecountQuery + ")) as jaydata__inlinecount, ");
            if (sql.text.indexOf(",  DISTINCT") > 0) {
                sql.text = sql.text.replace(",  DISTINCT", ",").replace(new RegExp("^SELECT"), "SELECT DISTINCT");
            }
            sql.params = params.concat(sql.params);
        }
        result.text = result.text.replace(new RegExp("(t[0-9]+)\\.(.*?)(\\s|,|\\)|$)", "gi"), "[$1].[$2]$3");
        result.text = result.text.replace(new RegExp("(FROM|LEFT OUTER JOIN) ([\\w]+?) (t[0-9]+)", "gi"), "$1 [$2] [$3]");
        this.filters.push(sqlBuilder);
    },

    VisitToArrayExpression: function VisitToArrayExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
    },
    VisitCountExpression: function VisitCountExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('count');
        sqlBuilder.addText(SqlStatementBlocks.count);
    },
    VisitFilterExpression: function VisitFilterExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('filter');
        if (sqlBuilder.selectedFragment.text) {
            sqlBuilder.addText(" AND ");
        } else {
            sqlBuilder.addText(SqlStatementBlocks.where);
        }
        var filterCompiler = _core2.default.sqLitePro.SqlFilterCompiler.create();
        filterCompiler.Visit(expression.selector, sqlBuilder);
        return expression;
    },
    VisitOrderExpression: function VisitOrderExpression(expression, sqlBuilder, noVisit) {
        if (!noVisit) {
            this.Visit(expression.source, sqlBuilder);
        }
        sqlBuilder.selectTextPart('order');
        if (this.addOrders) {
            sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
        } else {
            this.addOrders = true;
            sqlBuilder.addText(SqlStatementBlocks.order);
        }
        var orderCompiler = _core2.default.sqLitePro.SqlOrderCompiler.create();
        orderCompiler.Visit(expression, sqlBuilder);

        return expression;
    },
    VisitGroupExpression: function VisitGroupExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('group');
        if (this.addGroups) {
            sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
        } else {
            this.addGroups = true;
            sqlBuilder.addText(SqlStatementBlocks.group);
        }
        var orderCompiler = _core2.default.sqLitePro.SqlOrderCompiler.create();
        orderCompiler.Visit(expression, sqlBuilder);

        return expression;
    },
    VisitDistinctExpression: function VisitDistinctExpression(expression, sqlBuilder) {
        sqlBuilder.selectTextPart("distinct");
        sqlBuilder.addText(SqlStatementBlocks.distinct);
        this.Visit(expression.source, sqlBuilder);
        return expression;
    },
    VisitPagingExpression: function VisitPagingExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        switch (expression.nodeType) {
            case _core2.default.Expressions.ExpressionType.Skip:
                sqlBuilder.selectTextPart('skip');
                sqlBuilder.addText(SqlStatementBlocks.skip);break;
            case _core2.default.Expressions.ExpressionType.Take:
                sqlBuilder.selectTextPart('take');
                sqlBuilder.addText(SqlStatementBlocks.take);break;
            default:
                _core.Guard.raise("Not supported nodeType");break;
        }
        var pagingCompiler = _core2.default.sqLitePro.SqlPagingCompiler.create();
        pagingCompiler.Visit(expression, sqlBuilder);
        return expression;
    },
    VisitProjectionExpression: function VisitProjectionExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('projection');
        this.hasProjection = true;
        sqlBuilder.addText(SqlStatementBlocks.select);
        if (sqlBuilder.getTextPart("distinct")) {
            sqlBuilder.addText(SqlStatementBlocks.distinct);
        }
        var projectonCompiler = _core2.default.sqLitePro.SqlProjectionCompiler.create();
        projectonCompiler.Visit(expression, sqlBuilder);
    },
    VisitEntitySetExpression: function VisitEntitySetExpression(expression, sqlBuilder) {
        sqlBuilder.selectTextPart('from');
        sqlBuilder.addText(SqlStatementBlocks.from);
        sqlBuilder.sets.forEach(function (es, setIndex) {

            if (setIndex > 0) {
                sqlBuilder.addText(" \n\tLEFT OUTER JOIN ");
            }

            var alias = sqlBuilder.getExpressionAlias(es);
            if (setIndex == 0 && sqlBuilder.sets.length > 1) {
                sqlBuilder.pagingExpressionTable = es.instance.tableName;
            }
            sqlBuilder.addText(es.instance.tableName);
            if (!sqlBuilder.getTextPart("delete")) sqlBuilder.addText(' ' + alias);

            if (setIndex > 0) {
                sqlBuilder.addText(" ON (");
                var toSet = this.infos[setIndex];
                var toPrefix = "T" + toSet.AliasNumber;
                var fromSetName = toSet.NavigationPath.substring(0, toSet.NavigationPath.lastIndexOf('.'));
                var temp = this.infos.filter(function (inf) {
                    return inf.NavigationPath == fromSetName;
                }, this);
                var fromPrefix = "T0";
                if (temp.length > 0) {
                    fromPrefix = "T" + temp[0].AliasNumber;
                }
                toSet.Association.associationInfo.ReferentialConstraint.forEach(function (constrain, index) {
                    if (index > 0) {
                        sqlBuilder.addText(" AND ");
                    }
                    sqlBuilder.addText(fromPrefix + "." + constrain[toSet.Association.associationInfo.From]);
                    sqlBuilder.addText(" = ");
                    sqlBuilder.addText(toPrefix + "." + constrain[toSet.Association.associationInfo.To]);
                }, this);
                if (toSet.FrameOperation) {
                    var compiler = this;
                    var frameOperation = toSet.FrameOperation;
                    while (frameOperation && frameOperation instanceof _core2.default.Expressions.FrameOperationExpression) {
                        frameOperation.parameters.forEach(function (expression, i) {
                            switch (expression.expressionType) {
                                case _core2.default.Expressions.FilterExpression:
                                    sqlBuilder.addText(" AND ");
                                    var filterCompiler = _core2.default.sqLitePro.SqlFilterCompiler.create();
                                    filterCompiler.Visit(expression.selector, sqlBuilder);
                                    break;
                                case _core2.default.Expressions.OrderExpression:
                                    if (!compiler.frameOperationOrderBys) {
                                        compiler.frameOperationOrderBys = [];
                                    }
                                    compiler.frameOperationOrderBys.push(expression.selector);
                                    break;
                            }
                        });
                        frameOperation = frameOperation.source;
                    }
                }
                sqlBuilder.addText(")");
            }
        }, this);
    },
    VisitInlineCountExpression: function VisitInlineCountExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart("inlinecount");
        sqlBuilder.addText("SELECT COUNT(*) FROM");
    },
    VisitBatchDeleteExpression: function VisitBatchDeleteExpression(expression, sqlBuilder) {
        sqlBuilder.selectTextPart("delete");
        sqlBuilder.addText("DELETE");
        this.Visit(expression.source, sqlBuilder);
        this.batchDelete = true;
    },
    VisitDefaultProjection: function VisitDefaultProjection(sqlBuilder) {
        sqlBuilder.selectTextPart('projection');
        var needAlias = this.infos.filter(function (i) {
            return i.IsMapped;
        }).length > 1;
        if (sqlBuilder.sets.length > 1) {
            sqlBuilder.addText(SqlStatementBlocks.select);
            sqlBuilder.sets.forEach(function (set, masterIndex) {

                if (this.infos[masterIndex].IsMapped) {
                    var alias = sqlBuilder.getExpressionAlias(set);
                    set.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberDef, index) {
                        if (index > 0 || masterIndex > 0) {
                            sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                        }
                        sqlBuilder.addText(alias + ".");
                        sqlBuilder.addText(memberDef.name);
                        if (needAlias) {
                            sqlBuilder.addText(SqlStatementBlocks.as);
                            sqlBuilder.addText(alias + "__" + memberDef.name);
                        }
                    }, this);
                }
            }, this);
        } else {
            if (sqlBuilder.getTextPart("distinct")) {
                sqlBuilder.addText(SqlStatementBlocks.select + SqlStatementBlocks.distinct + "*");
            } else sqlBuilder.addText("SELECT *");
        }
    }
});

_core2.default.Expressions.ExpressionNode.prototype.monitor = function (monitorDefinition, context) {
    var m = _core2.default.sqLitePro.SqlExpressionMonitor.create(monitorDefinition);
    return m.Visit(this, context);
};

(0, _core.$C)('$data.storageProviders.sqLitePro.SQLiteCompiler', null, null, {
    compile: function compile(query) {
        /// <param name="query" type="$data.Query" />
        var expression = query.expression;
        var context = { sets: [], infos: [], entityContext: query.context };

        var buildPathFromExpressionTree = function buildPathFromExpressionTree(expression, path) {
            path = path || '';
            if (expression instanceof _core2.default.Expressions.EntityExpression && expression.selector && expression.selector.lambda != 'it') {
                path = expression.source.selector.associationInfo.FromPropertyName + "." + path;
                return buildPathFromExpressionTree(expression.source.source, path);
            } else if (expression instanceof _core2.default.Expressions.EntitySetExpression) {
                path = expression.source.storageModel.Associations.find(function (it) {
                    return it.FromType == (expression.source.entityType || expression.source.elementType) && it.ToType == expression.elementType;
                }).FromPropertyName + '.' + path;
                return buildPathFromExpressionTree(expression.source, path);
            } else if (expression instanceof _core2.default.Expressions.FrameOperationExpression) {
                return buildPathFromExpressionTree(expression.source, path);
            }
            return path.replace(/\.$/, '');
        };

        var optimizedIncludeExpression = expression.monitor({
            MonitorEntitySetExpression: function MonitorEntitySetExpression(expression, context) {
                if (expression.source instanceof _core2.default.Expressions.EntityContextExpression && context && context.sets.indexOf(expression) == -1) {
                    this.backupEntitySetExpression = expression;
                }
            },
            VisitCountExpression: function VisitCountExpression(expression, context) {
                context.hasCountFrameOperator = true;
                return expression;
            },
            MutateIncludeExpression: function MutateIncludeExpression(expression, context) {
                var result = null;
                if (context.hasCountFrameOperator) {
                    result = expression.source;
                } else if (expression.selector instanceof _core2.default.Expressions.ConstantExpression) {
                    var origSelector = expression.selector.value;
                    _core.Container.createCodeExpression("function(it){return it." + origSelector + ";}", null);

                    var jsCodeTree = _core.Container.createCodeParser(this.backupEntitySetExpression.source.instance).createExpression("function(it){return it." + origSelector + ";}");
                    var code2entity = _core.Container.createCodeToEntityConverter(this.backupEntitySetExpression.source.instance);
                    var includeSelector = code2entity.Visit(jsCodeTree, { queryParameters: undefined, lambdaParameters: [this.backupEntitySetExpression] });

                    result = _core.Container.createIncludeExpression(expression.source, includeSelector);
                } else if (expression.selector instanceof _core2.default.Expressions.ParametricQueryExpression) {
                    if (expression.selector.expression instanceof _core2.default.Expressions.FrameOperationExpression) {
                        var origSelector = buildPathFromExpressionTree(expression.selector.expression);
                        _core.Container.createCodeExpression("function(it){return it." + origSelector + ";}", null);

                        var jsCodeTree = _core.Container.createCodeParser(this.backupEntitySetExpression.source.instance).createExpression("function(it){return it." + origSelector + ";}");
                        var code2entity = _core.Container.createCodeToEntityConverter(this.backupEntitySetExpression.source.instance);
                        var includeSelector = code2entity.Visit(jsCodeTree, { queryParameters: undefined, lambdaParameters: [this.backupEntitySetExpression] });

                        var lastFrameOperationExpression = expression.selector.expression;
                        while (lastFrameOperationExpression.source instanceof _core2.default.Expressions.FrameOperationExpression) {
                            lastFrameOperationExpression = lastFrameOperationExpression.source;
                        }
                        lastFrameOperationExpression.source = includeSelector.source;
                        includeSelector.source = expression.selector.expression;
                        result = _core.Container.createIncludeExpression(expression.source, includeSelector);
                    } else if (expression.selector.expression instanceof _core2.default.Expressions.EntitySetExpression) {
                        var origSelector = buildPathFromExpressionTree(expression.selector.expression);
                        _core.Container.createCodeExpression("function(it){return it." + origSelector + ";}", null);

                        var jsCodeTree = _core.Container.createCodeParser(this.backupEntitySetExpression.source.instance).createExpression("function(it){return it." + origSelector + ";}");
                        var code2entity = _core.Container.createCodeToEntityConverter(this.backupEntitySetExpression.source.instance);
                        var includeSelector = code2entity.Visit(jsCodeTree, { queryParameters: undefined, lambdaParameters: [this.backupEntitySetExpression] });

                        result = _core.Container.createIncludeExpression(expression.source, includeSelector);
                    } else if (expression.selector.expression instanceof _core2.default.Expressions.EntityExpression) {
                        var origSelector = buildPathFromExpressionTree(expression.selector.expression);
                        _core.Container.createCodeExpression("function(it){return it." + origSelector + ";}", null);

                        var jsCodeTree = _core.Container.createCodeParser(this.backupEntitySetExpression.source.instance).createExpression("function(it){return it." + origSelector + ";}");
                        var code2entity = _core.Container.createCodeToEntityConverter(this.backupEntitySetExpression.source.instance);
                        var includeSelector = code2entity.Visit(jsCodeTree, { queryParameters: undefined, lambdaParameters: [this.backupEntitySetExpression] });

                        result = _core.Container.createIncludeExpression(expression.source, includeSelector);
                    }
                }
                return result;
            }
        }, context);

        var optimizedExpression = optimizedIncludeExpression.monitor({
            MonitorEntitySetExpression: function MonitorEntitySetExpression(expression, context) {
                if (expression.source instanceof _core2.default.Expressions.EntityContextExpression && context && context.sets.indexOf(expression) == -1 && context.sets.length == 0) {
                    context.sets.push(expression);
                    context.infos.push({ AliasNumber: 0, Association: null, FromType: null, FromPropertyName: null, IsMapped: true });
                }
            },
            MutateEntitySetExpression: function MutateEntitySetExpression(expression, context) {
                if (expression.source instanceof _core2.default.Expressions.EntityContextExpression) {
                    this.backupContextExpression = expression.source;
                    this.path = "";
                    return expression;
                }
                if (expression.selector.associationInfo.FromMultiplicity == "0..1" && expression.selector.associationInfo.FromMultiplicity == "*") {
                    _core.Guard.raise("Not supported query on this navigation property: " + expression.selector.associationInfo.From + " " + expression.selector.associationInfo.FromPropertyName);
                }

                this.path += '.' + expression.selector.associationInfo.FromPropertyName;
                var info = context.infos.find(function (inf) {
                    return inf.NavigationPath == this.path;
                }, this);
                if (info) {
                    info.IsMapped = info.IsMapped || this.isMapped;
                    if (expression.source instanceof _core2.default.Expressions.FrameOperationExpression) {
                        if (info.FrameOperation) {
                            info.FrameOperation.source = expression.source;
                        } else {
                            info.FrameOperation = expression.source;
                        }
                    }
                    return context.sets[info.AliasNumber];
                }
                var memberDefinitions = this.backupContextExpression.instance.getType().memberDefinitions.getMember(expression.storageModel.ItemName);
                if (!memberDefinitions) {
                    _core.Guard.raise("Context schema error");
                }
                var mi = _core.Container.createMemberInfoExpression(memberDefinitions);
                var result = _core.Container.createEntitySetExpression(this.backupContextExpression, mi);
                result.instance = this.backupContextExpression.instance[expression.storageModel.ItemName];
                var aliasNum = context.sets.push(result);
                context.infos.push({
                    AliasNumber: aliasNum - 1,
                    Association: expression.selector,
                    NavigationPath: this.path,
                    IsMapped: this.isMapped,
                    FrameOperation: expression.source instanceof _core2.default.Expressions.FrameOperationExpression ? expression.source : false
                });
                return result;
            }
        }, context);

        var compiler = _core2.default.sqLitePro.SqlCompiler.create(optimizedExpression, context);
        compiler.compile();

        var sqlBuilder = _core2.default.sqLitePro.SqlBuilder.create(this.sets, this.entityContext);

        query.modelBinderConfig = {};
        var modelBinder = _core2.default.sqLitePro.sqLite_ModelBinderCompiler.create(query, context);
        modelBinder.Visit(optimizedExpression);

        var result = {
            sqlText: compiler.filters[0].selectedFragment.text,
            params: compiler.filters[0].selectedFragment.params,
            modelBinderConfig: query.modelBinderConfig,
            withInlineCount: compiler.withInlineCount || false,
            batchDelete: compiler.batchDelete || false
        };

        return result;
    }
}, null);

},{"jaydata/core":"jaydata/core"}],11:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.SqLiteProConverter = {
    fromDb: {
        '$data.Enum': function $dataEnum(v, enumType) {
            return _core2.default.Container.convertTo(v, enumType);
        },
        '$data.Duration': _core2.default.Container.proxyConverter,
        '$data.Day': _core2.default.Container.proxyConverter,
        '$data.Byte': _core2.default.Container.proxyConverter,
        '$data.SByte': _core2.default.Container.proxyConverter,
        '$data.Decimal': _core2.default.Container.proxyConverter,
        '$data.Float': _core2.default.Container.proxyConverter,
        '$data.Int16': _core2.default.Container.proxyConverter,
        '$data.Int64': _core2.default.Container.proxyConverter,
        "$data.Integer": _core2.default.Container.proxyConverter,
        "$data.Int32": _core2.default.Container.proxyConverter,
        "$data.Number": _core2.default.Container.proxyConverter,
        "$data.Date": function $dataDate(dbData) {
            return dbData != null ? new Date(dbData) : dbData;
        },
        "$data.DateTimeOffset": function $dataDateTimeOffset(dbData) {
            return dbData != null ? new Date(dbData) : dbData;
        },
        "$data.Time": _core2.default.Container.proxyConverter,
        "$data.String": _core2.default.Container.proxyConverter,
        "$data.Boolean": function $dataBoolean(b) {
            return _core.Guard.isNullOrUndefined(b) ? b : b === 1 ? true : false;
        },
        "$data.Blob": function $dataBlob(b) {
            return b ? _core2.default.Container.convertTo(atob(b), _core2.default.Blob) : b;
        },
        "$data.Array": function $dataArray() {
            if (arguments.length == 0) return [];
            return arguments[0] ? JSON.parse(arguments[0]) : undefined;
        },
        "$data.Object": function $dataObject(v) {
            try {
                return JSON.parse(v);
            } catch (err) {
                return v;
            }
        },
        "$data.Guid": function $dataGuid(g) {
            return g ? _core2.default.parseGuid(g).toString() : g;
        },
        '$data.GeographyPoint': function $dataGeographyPoint(g) {
            if (g) {
                return new _core2.default.GeographyPoint(JSON.parse(g));
            }return g;
        },
        '$data.GeographyLineString': function $dataGeographyLineString(g) {
            if (g) {
                return new _core2.default.GeographyLineString(JSON.parse(g));
            }return g;
        },
        '$data.GeographyPolygon': function $dataGeographyPolygon(g) {
            if (g) {
                return new _core2.default.GeographyPolygon(JSON.parse(g));
            }return g;
        },
        '$data.GeographyMultiPoint': function $dataGeographyMultiPoint(g) {
            if (g) {
                return new _core2.default.GeographyMultiPoint(JSON.parse(g));
            }return g;
        },
        '$data.GeographyMultiLineString': function $dataGeographyMultiLineString(g) {
            if (g) {
                return new _core2.default.GeographyMultiLineString(JSON.parse(g));
            }return g;
        },
        '$data.GeographyMultiPolygon': function $dataGeographyMultiPolygon(g) {
            if (g) {
                return new _core2.default.GeographyMultiPolygon(JSON.parse(g));
            }return g;
        },
        '$data.GeographyCollection': function $dataGeographyCollection(g) {
            if (g) {
                return new _core2.default.GeographyCollection(JSON.parse(g));
            }return g;
        },
        '$data.GeometryPoint': function $dataGeometryPoint(g) {
            if (g) {
                return new _core2.default.GeometryPoint(JSON.parse(g));
            }return g;
        },
        '$data.GeometryLineString': function $dataGeometryLineString(g) {
            if (g) {
                return new _core2.default.GeometryLineString(JSON.parse(g));
            }return g;
        },
        '$data.GeometryPolygon': function $dataGeometryPolygon(g) {
            if (g) {
                return new _core2.default.GeometryPolygon(JSON.parse(g));
            }return g;
        },
        '$data.GeometryMultiPoint': function $dataGeometryMultiPoint(g) {
            if (g) {
                return new _core2.default.GeometryMultiPoint(JSON.parse(g));
            }return g;
        },
        '$data.GeometryMultiLineString': function $dataGeometryMultiLineString(g) {
            if (g) {
                return new _core2.default.GeometryMultiLineString(JSON.parse(g));
            }return g;
        },
        '$data.GeometryMultiPolygon': function $dataGeometryMultiPolygon(g) {
            if (g) {
                return new _core2.default.GeometryMultiPolygon(JSON.parse(g));
            }return g;
        },
        '$data.GeometryCollection': function $dataGeometryCollection(g) {
            if (g) {
                return new _core2.default.GeometryCollection(JSON.parse(g));
            }return g;
        }
    },
    toDb: {
        '$data.Enum': _core2.default.Container.proxyConverter,
        '$data.Duration': _core2.default.Container.proxyConverter,
        '$data.Day': _core2.default.Container.proxyConverter,
        '$data.Byte': _core2.default.Container.proxyConverter,
        '$data.SByte': _core2.default.Container.proxyConverter,
        '$data.Decimal': _core2.default.Container.proxyConverter,
        '$data.Float': _core2.default.Container.proxyConverter,
        '$data.Int16': _core2.default.Container.proxyConverter,
        '$data.Int64': _core2.default.Container.proxyConverter,
        "$data.Integer": _core2.default.Container.proxyConverter,
        "$data.Int32": _core2.default.Container.proxyConverter,
        "$data.Number": _core2.default.Container.proxyConverter,
        "$data.Date": function $dataDate(date) {
            return date ? date.valueOf() : null;
        },
        "$data.DateTimeOffset": function $dataDateTimeOffset(date) {
            return date ? date.valueOf() : null;
        },
        "$data.Time": _core2.default.Container.proxyConverter,
        "$data.String": _core2.default.Container.proxyConverter,
        "$data.Boolean": function $dataBoolean(b) {
            return _core.Guard.isNullOrUndefined(b) ? b : b ? 1 : 0;
        },
        "$data.Blob": function $dataBlob(b) {
            return b ? _core2.default.Blob.toBase64(b) : b;
        },
        "$data.Array": function $dataArray(arr) {
            return arr ? JSON.stringify(arr) : arr;
        },
        "$data.Guid": function $dataGuid(g) {
            return g ? g.toString() : g;
        },
        "$data.Object": function $dataObject(value) {
            if (value === null) {
                return null;
            } else {
                JSON.stringify(value);
            }
        },
        '$data.GeographyPoint': function $dataGeographyPoint(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeographyLineString': function $dataGeographyLineString(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeographyPolygon': function $dataGeographyPolygon(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeographyMultiPoint': function $dataGeographyMultiPoint(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeographyMultiLineString': function $dataGeographyMultiLineString(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeographyMultiPolygon': function $dataGeographyMultiPolygon(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeographyCollection': function $dataGeographyCollection(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeometryPoint': function $dataGeometryPoint(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeometryLineString': function $dataGeometryLineString(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeometryPolygon': function $dataGeometryPolygon(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeometryMultiPoint': function $dataGeometryMultiPoint(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeometryMultiLineString': function $dataGeometryMultiLineString(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeometryMultiPolygon': function $dataGeometryMultiPolygon(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        },
        '$data.GeometryCollection': function $dataGeometryCollection(g) {
            if (g) {
                return JSON.stringify(g);
            }return g;
        }
    }
};

_core2.default.SqLiteProFieldMapping = {
    '$data.Byte': "INTEGER",
    '$data.SByte': "INTEGER",
    '$data.Decimal': "TEXT",
    '$data.Float': "REAL",
    '$data.Int16': "INTEGER",
    '$data.Int64': "TEXT",
    "$data.Integer": "INTEGER",
    "$data.Int32": "INTEGER",
    "$data.Number": "REAL",
    "$data.Date": "REAL",
    "$data.Duration": "TEXT",
    "$data.Time": "TEXT",
    "$data.Day": "TEXT",
    "$data.DateTimeOffset": "REAL",
    "$data.String": "TEXT",
    "$data.Boolean": "INTEGER",
    "$data.Blob": "BLOB",
    "$data.Array": "TEXT",
    "$data.Guid": "TEXT",
    "$data.Object": "TEXT",
    '$data.GeographyPoint': "TEXT",
    '$data.GeographyLineString': "TEXT",
    '$data.GeographyPolygon': "TEXT",
    '$data.GeographyMultiPoint': "TEXT",
    '$data.GeographyMultiLineString': "TEXT",
    '$data.GeographyMultiPolygon': "TEXT",
    '$data.GeographyCollection': "TEXT",
    '$data.GeometryPoint': "TEXT",
    '$data.GeometryLineString': "TEXT",
    '$data.GeometryPolygon': "TEXT",
    '$data.GeometryMultiPoint': "TEXT",
    '$data.GeometryMultiLineString': "TEXT",
    '$data.GeometryMultiPolygon': "TEXT",
    '$data.GeometryCollection': "TEXT"
};

},{"jaydata/core":"jaydata/core"}],12:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.storageProviders.sqLitePro.SqLiteStorageProvider', _core2.default.StorageProviderBase, null, {
    constructor: function constructor(cfg, context) {
        this.SqlCommands = [];
        this.context = context;
        this.providerConfiguration = _core2.default.typeSystem.extend({
            databaseName: _core2.default.defaults.defaultDatabaseName,
            version: "",
            displayName: "JayData default db",
            maxSize: 1024 * 1024,
            dbCreation: _core2.default.storageProviders.DbCreationType.DropTableIfChanged
        }, cfg);

        this.providerName = '';
        for (var i in _core2.default.RegisteredStorageProviders) {
            if (_core2.default.RegisteredStorageProviders[i] === this.getType()) {
                this.providerName = i;
            }
        }

        if (this.context && this.context._buildDbType_generateConvertToFunction && this.buildDbType_generateConvertToFunction) {
            this.context._buildDbType_generateConvertToFunction = this.buildDbType_generateConvertToFunction;
        }
        if (this.context && this.context._buildDbType_modifyInstanceDefinition && this.buildDbType_modifyInstanceDefinition) {
            this.context._buildDbType_modifyInstanceDefinition = this.buildDbType_modifyInstanceDefinition;
        }
    },
    _createSqlConnection: function _createSqlConnection() {
        var ctorParm = {
            fileName: this.providerConfiguration.databaseName,
            version: "",
            displayName: this.providerConfiguration.displayName,
            maxSize: this.providerConfiguration.maxSize,
            storage: this.providerConfiguration.storage
        };

        if (this.connection) return this.connection;

        var connection = null;
        if (this.providerConfiguration.storage) {
            connection = new _core2.default.dbClient.jayStorageClient.JayStorageConnection(ctorParm);
        } else if (typeof sqLiteModule !== 'undefined') {
            connection = new _core2.default.dbClient.sqLiteNJClient.SqLiteNjConnection(ctorParm);
        } else {
            connection = new _core2.default.dbClient.openDatabaseClient.OpenDbConnection(ctorParm);
        }

        this.connection = connection;

        return connection;
    },

    supportedDataTypes: {
        value: [_core2.default.Array, _core2.default.Integer, _core2.default.String, _core2.default.Number, _core2.default.Blob, _core2.default.Array, _core2.default.Object, _core2.default.Boolean, _core2.default.Date, _core2.default.Guid, _core2.default.GeographyPoint, _core2.default.GeographyLineString, _core2.default.GeographyPolygon, _core2.default.GeographyMultiPoint, _core2.default.GeographyMultiLineString, _core2.default.GeographyMultiPolygon, _core2.default.GeographyCollection, _core2.default.GeometryPoint, _core2.default.GeometryLineString, _core2.default.GeometryPolygon, _core2.default.GeometryMultiPoint, _core2.default.GeometryMultiLineString, _core2.default.GeometryMultiPolygon, _core2.default.GeometryCollection, _core2.default.Byte, _core2.default.SByte, _core2.default.Decimal, _core2.default.Float, _core2.default.Int16, _core2.default.Int32, _core2.default.Int64, _core2.default.Time, _core2.default.DateTimeOffset, _core2.default.Duration, _core2.default.Day],
        writable: false
    },
    fieldConverter: { value: _core2.default.SqLiteProConverter },

    supportedFieldOperations: {
        value: {
            length: {
                dataType: "number", allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression]
            },
            substr: {
                dataType: "string",
                allowedIn: _core2.default.Expressions.FilterExpression,
                parameters: [{ name: "startFrom", dataType: "number" }, { name: "length", dataType: "number" }]
            },
            toLowerCase: {
                dataType: "string", mapTo: "lower"
            },
            toUpperCase: {
                dataType: "string", mapTo: "upper"
            },
            contains: {
                mapTo: "like",
                dataType: "boolean",
                allowedIn: _core2.default.Expressions.FilterExpression,
                parameters: [{ name: "strFragment", dataType: "string", prefix: "%", suffix: "%" }]
            },
            startsWith: {
                mapTo: "like",
                dataType: "boolean",
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression],
                parameters: [{ name: "strFragment", dataType: "string", suffix: "%" }]
            },
            endsWith: {
                mapTo: "like",
                dataType: "boolean",
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression],
                parameters: [{ name: "strFragment", dataType: "string", prefix: "%" }]
            },
            'trim': {
                dataType: _core2.default.String,
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression],
                mapTo: 'trim',
                parameters: [{ name: '@expression', dataType: _core2.default.String }, { name: 'chars', dataType: _core2.default.String }]
            },
            'ltrim': {
                dataType: _core2.default.String,
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression],
                mapTo: 'ltrim',
                parameters: [{ name: '@expression', dataType: _core2.default.String }, { name: 'chars', dataType: _core2.default.String }]
            },
            'rtrim': {
                dataType: _core2.default.String,
                allowedIn: [_core2.default.Expressions.FilterExpression, _core2.default.Expressions.ProjectionExpression],
                mapTo: 'rtrim',
                parameters: [{ name: '@expression', dataType: _core2.default.String }, { name: 'chars', dataType: _core2.default.String }]
            },
            'sum': {
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.OrderExpression],
                mapTo: 'sum'
            },
            'count': {
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.OrderExpression],
                mapTo: 'count',
                returnType: _core2.default.Integer
            },
            'min': {
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.OrderExpression],
                mapTo: 'min'
            },
            'max': {
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.OrderExpression],
                mapTo: 'max'
            },
            'avg': {
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.OrderExpression],
                mapTo: 'avg'
            },
            'strftime': {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.FilterExpression],
                mapTo: 'strftime',
                parameters: [{ name: 'format', dataType: _core2.default.String }, { name: "@expression" }],
                returnType: _core2.default.String
            },
            'date': {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.FilterExpression],
                mapTo: 'date',
                parameters: [{ name: 'format', dataType: _core2.default.String }, { name: "@expression" }],
                returnType: _core2.default.String
            },
            'time': {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.FilterExpression],
                mapTo: 'time',
                parameters: [{ name: 'format', dataType: _core2.default.String }, { name: "@expression" }],
                returnType: _core2.default.String
            },
            'datetime': {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.FilterExpression],
                mapTo: 'datetime',
                parameters: [{ name: 'format', dataType: _core2.default.String }, { name: "@expression" }],
                returnType: _core2.default.String
            },
            'julianday': {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.FilterExpression],
                mapTo: 'julianday',
                parameters: [{ name: 'format', dataType: _core2.default.String }, { name: "@expression" }],
                returnType: _core2.default.String
            },
            day: {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.FilterExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ value: "'%d'" }, { name: "@expression", dataType: "date", wrap: '@exp / 1000' }, { value: "'unixepoch'" }],
                mapTo: 'strftime',
                wrap: 'cast(@call as int)',
                returnType: _core2.default.Number
            },
            hour: {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.FilterExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ value: "'%H'" }, { name: "@expression", dataType: "date", wrap: '@exp / 1000' }, { value: "'unixepoch'" }],
                mapTo: 'strftime',
                wrap: 'cast(@call as int)',
                returnType: _core2.default.Number
            },
            minute: {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.FilterExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ value: "'%M'" }, { name: "@expression", dataType: "date", wrap: '@exp / 1000' }, { value: "'unixepoch'" }],
                mapTo: 'strftime',
                wrap: 'cast(@call as int)',
                returnType: _core2.default.Number
            },
            month: {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.FilterExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ value: "'%m'" }, { name: "@expression", dataType: "date", wrap: '@exp / 1000' }, { value: "'unixepoch'" }],
                mapTo: 'strftime',
                wrap: 'cast(@call as int)',
                returnType: _core2.default.Number
            },
            second: {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.FilterExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ value: "'%S'" }, { name: "@expression", dataType: "date", wrap: '@exp / 1000' }, { value: "'unixepoch'" }],
                mapTo: 'strftime',
                wrap: 'cast(@call as int)',
                returnType: _core2.default.Number
            },
            year: {
                type: 'date',
                allowedIn: [_core2.default.Expressions.ProjectionExpression, _core2.default.Expressions.FilterExpression, _core2.default.Expressions.GroupExpression, _core2.default.Expressions.OrderExpression],
                parameters: [{ value: "'%Y'" }, { name: "@expression", dataType: "date", wrap: '@exp / 1000' }, { value: "'unixepoch'" }],
                mapTo: 'strftime',
                wrap: 'cast(@call as int)',
                returnType: _core2.default.Number
            }
        },
        enumerable: true,
        writable: true
    },

    supportedBinaryOperators: {
        value: {
            equal: { mapTo: '=', dataType: "boolean", nullMap: ' is null' },
            notEqual: { mapTo: '!=', dataType: "boolean", nullMap: ' is not null' },
            equalTyped: { mapTo: '=', dataType: "boolean", nullMap: ' is null' },
            notEqualTyped: { mapTo: '!=', dataType: "boolean", nullMap: ' is not null' },
            greaterThan: { mapTo: '>', dataType: "boolean" },
            greaterThanOrEqual: { mapTo: '>=', dataType: "boolean" },

            lessThan: { mapTo: '<', dataType: "boolean" },
            lessThenOrEqual: { mapTo: '<=', dataType: "boolean" },
            or: { mapTo: 'OR', dataType: "boolean" },
            and: { mapTo: 'AND', dataType: "boolean" },

            add: { mapTo: '+', dataType: "number" },
            divide: { mapTo: '/' },
            multiply: { mapTo: '*' },
            subtract: { mapTo: '-' },
            modulo: { mapTo: '%' },

            orBitwise: { maptTo: "|" },
            andBitwsise: { mapTo: "&" },

            "in": { mapTo: "in", dataType: "boolean" }
        }
    },

    supportedUnaryOperators: {
        value: {
            not: { mapTo: 'not' },
            positive: { mapTo: '+' },
            negative: { maptTo: '-' }
        }
    },

    supportedSetOperations: {
        value: {
            filter: {
                allowedIn: [_core2.default.Expressions.IncludeExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                frameType: _core2.default.Expressions.FilterExpression
            },
            map: {},
            length: {},
            forEach: {},
            toArray: {},
            single: {},
            take: {},
            skip: {},
            orderBy: {
                allowedIn: [_core2.default.Expressions.IncludeExpression],
                parameters: [{ name: "orderBy", dataType: "$data.Queryable" }],
                frameType: _core2.default.Expressions.OrderExpression
            },
            orderByDescending: {
                allowedIn: [_core2.default.Expressions.IncludeExpression],
                parameters: [{ name: "orderByDescending", dataType: "$data.Queryable" }],
                frameType: _core2.default.Expressions.OrderExpression
            },
            groupBy: {},
            first: {},
            include: {},
            distinct: {},
            withInlineCount: {},
            batchDelete: {}
        },
        enumerable: true,
        writable: true
    },

    supportedAutoincrementKeys: {
        value: {
            '$data.Integer': true,
            '$data.Int32': true,
            '$data.Guid': function $dataGuid() {
                return _core2.default.createGuid();
            }
        }
    },

    _beginTran: function _beginTran(tableList, isWrite, callBack) {
        var self = this;
        callBack = _core2.default.typeSystem.createCallbackSetting(callBack);
        self._createSqlConnection();

        var transaction = new _core2.default.sqLitePro.SqlTransaction();
        function onComplete() {
            _core2.default.Trace.log("oncomplete: ", transaction._objectId);
            if (transaction.oncomplete) {
                transaction.oncomplete.fire(arguments, transaction);
            }
        }

        setTimeout(function () {
            self.connection.open({
                error: function error(err) {
                    _core2.default.Trace.log("onerror: ", transaction._objectId, arguments);
                    if (transaction.onerror) {
                        transaction.onerror.fire(err, transaction);
                    }
                },
                success: function success(tran) {
                    transaction.transaction = tran;
                    callBack.success(transaction);
                },
                oncomplete: onComplete
            }, undefined, isWrite);
        }, 0);
        //callBack.success(this.connection);
    },
    initializeStore: function initializeStore(callBack) {
        callBack = _core2.default.PromiseHandlerBase.createCallbackSettings(callBack);
        this.context._storageModel.forEach(function (item, index) {
            var indices = this.createSqlIndexFromStorageModel(item);
            this.SqlCommands = this.SqlCommands.concat(indices);
        }, this);
        var tableNames = [];
        this.context._storageModel.forEach(function (item, index) {
            this.SqlCommands.push(this.createSqlFromStorageModel(item) + " ");
            tableNames.push(item.TableName);
        }, this);

        var sqlConnection = this._createSqlConnection();
        var cmd = sqlConnection.createCommand("SELECT * FROM sqlite_master WHERE type = 'table'", null);
        var that = this;

        this.context.beginTransaction(true, function (tran) {
            cmd.executeQuery({
                success: function success(result, tran) {
                    var existObjectInDB = {};
                    for (var i = 0; i < result.rows.length; i++) {
                        var item = result.rows[i];
                        existObjectInDB[item.tbl_name] = item;
                    }
                    var hasDbChanges = false;
                    for (var i = 0; i < tableNames.length; i++) {
                        if (!existObjectInDB[tableNames[i]]) {
                            hasDbChanges = true;
                        }
                    }
                    switch (that.providerConfiguration.dbCreation) {
                        case _core2.default.storageProviders.DbCreationType.Merge:
                            _core.Guard.raise(new _core.Exception('Not supported db creation type'));
                            break;
                        case _core2.default.storageProviders.DbCreationType.DropTableIfChanged:
                            var deleteCmd = [];
                            for (var i = 0; i < that.SqlCommands.length; i++) {
                                if (that.SqlCommands[i] == "") {
                                    continue;
                                }
                                var regEx = new RegExp('^CREATE TABLE IF NOT EXISTS ([^ ]*) (\\(.*\\))', 'g');
                                var data = regEx.exec(that.SqlCommands[i]);
                                if (data) {
                                    var tableName = data[1];
                                    var tableDef = data[2];
                                    if (existObjectInDB[tableName.slice(1, tableName.length - 1)]) {
                                        var regex = new RegExp('\\(.*\\)', 'g');
                                        var existsRegExMatches = existObjectInDB[tableName.slice(1, tableName.length - 1)].sql.match(regex);

                                        if (!existsRegExMatches || tableDef.toLowerCase() != existsRegExMatches[0].toLowerCase() || that.context._deleteTables && that.context._deleteTables[tableName.slice(1, tableName.length - 1)]) {
                                            deleteCmd.push("DROP TABLE IF EXISTS [" + existObjectInDB[tableName.slice(1, tableName.length - 1)].tbl_name + "];");
                                            hasDbChanges = true;
                                        }
                                    }
                                } else {
                                    //console.dir(regEx);
                                    //console.dir(that.SqlCommands[i]);
                                }
                            }
                            that.SqlCommands = that.SqlCommands.concat(deleteCmd);
                            //console.log(deleteCmd);
                            break;
                        case _core2.default.storageProviders.DbCreationType.DropAllExistingTables:
                            for (var objName in existObjectInDB) {
                                if (objName && !objName.match('^__') && !objName.match('^sqlite_')) {
                                    that.SqlCommands.push("DROP TABLE IF EXISTS [" + existObjectInDB[objName].tbl_name + "];");
                                    hasDbChanges = true;
                                }
                            }
                            break;
                    }
                    if (that.context._deleteTables) {
                        var keys = Object.keys(that.context._deleteTables);
                        for (var i = 0; i < keys.length; i++) {
                            if (that.context._deleteTables[keys[i]]) {
                                that.SqlCommands.push("DROP TABLE IF EXISTS [" + keys[i] + "];");
                            }
                        }
                    }

                    that._runSqlCommands(sqlConnection, {
                        success: function success(ctx) {
                            if (hasDbChanges && typeof that.providerConfiguration.onUpdated === 'function') {
                                that.providerConfiguration.onUpdated(ctx, {
                                    success: function success() {
                                        callBack.success.apply(this, arguments);
                                    },
                                    error: function error(ex) {
                                        if (!ex || ex instanceof _core2.default.EntityContext) {
                                            ex = new _core.Exception('onUpdated failed');
                                        }

                                        callBack.error.call(this, ex);
                                    }
                                });
                            } else {
                                callBack.success.apply(this, arguments);
                            }
                        },
                        error: callBack.error
                    }, tran, true);
                },
                error: callBack.error
            }, tran, true);
        });
    },
    executeQuery: function executeQuery(query, callBack) {
        callBack = _core2.default.PromiseHandlerBase.createCallbackSettings(callBack);
        var sqlConnection = this._createSqlConnection();
        var sql = this._compile(query);
        query.actionPack = sql.actions;
        query.sqlConvertMetadata = sql.converter;
        query.modelBinderConfig = sql.modelBinderConfig;
        var sqlCommand = sqlConnection.createCommand(sql.sqlText, sql.params);
        var that = this;

        var innerCallback = {
            success: function success(sqlResult) {
                if (Array.isArray(sqlResult)) sqlResult = sqlResult[0];
                if (callBack.success) {
                    query.rawDataList = sqlResult.rows;
                    if (sql.withInlineCount) {
                        if (sqlResult.rows && sqlResult.rows[0] && typeof sqlResult.rows[0].jaydata__inlinecount == "number") {
                            query.__count = sqlResult.rows[0].jaydata__inlinecount;
                        } else query.__count = 0;
                    }
                    if (sql.batchDelete) {
                        if (_core2.default.QueryCache && typeof _core2.default.QueryCache.reset == "function") {
                            _core2.default.QueryCache.reset(that.context);
                        }
                        query.rawDataList = [{ cnt: sqlResult.rowsAffected }];
                    }
                    callBack.success(query);
                }
            },
            error: callBack.error
        };

        if (sql.batchDelete) {
            this._beginTran(null, true, function (tran) {
                sqlCommand.query = sqlCommand.query.replace(/\[T0\]\./g, '');
                sqlCommand.executeQuery(innerCallback, tran, true);
            });
        } else sqlCommand.executeQuery(innerCallback, query.transaction, false);
    },
    loadRawData: function loadRawData(tableName, callBack) {
        callBack = _core2.default.typeSystem.createCallbackSetting(callBack);
        var sqlConnection = this._createSqlConnection();

        var cmd = sqlConnection.createCommand("SELECT * FROM sqlite_master WHERE type = 'table'", null);
        cmd.executeQuery({
            success: function success(result, tran) {
                var isExistingTable = false;
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i].tbl_name === tableName) {
                        isExistingTable = true;
                        break;
                    }
                }

                if (!isExistingTable) {
                    return callBack.success([]);
                }

                var sqlCommand = sqlConnection.createCommand("SELECT * FROM " + tableName, null);

                sqlCommand.executeQuery({
                    success: function success(sqlResult) {
                        callBack.success(sqlResult.rows);
                    },
                    error: callBack.error
                }, tran);
            },
            error: callBack.error
        });
    },
    _compile: function _compile(query, params) {
        var compiler = new _core2.default.storageProviders.sqLitePro.SQLiteCompiler();
        var compiled = compiler.compile(query);
        //console.dir(compiled);
        compiled.hasSelect = compiler.select != null;
        return compiled;
    },
    getTraceString: function getTraceString(query) {
        var sqlText = this._compile(query);
        return sqlText;
    },
    _runSqlCommands: function _runSqlCommands(sqlConnection, callBack, tran, isWrite) {
        if (this.SqlCommands && this.SqlCommands.length > 0) {
            var cmdStr = this.SqlCommands.pop();
            var command = sqlConnection.createCommand(cmdStr, null);
            var that = this;
            var okFn = function okFn(result) {
                that._runSqlCommands.apply(that, [sqlConnection, callBack, tran, isWrite]);
            };
            command.executeQuery({ success: okFn, error: callBack.error }, tran, isWrite);
        } else {
            callBack.success(this.context);
        }
    },
    setContext: function setContext(ctx) {
        this.context = ctx;
    },
    saveChanges: function saveChanges(callback, changedItems, tran) {
        var provider = this;
        this._saveChangesWithTran(callback, changedItems, tran);
    },
    _saveChangesWithTran: function _saveChangesWithTran(callback, changedItems, tran) {
        var sqlConnection = this._createSqlConnection();
        var independentBlocks = this.buildIndependentBlocks(changedItems);

        var _tranError;
        _tranError = function tranError(sender, event) {
            tran.onerror.detach(_tranError);
            callback.error.call(this, event);
        };

        tran.onerror.attach(_tranError);
        this.saveIndependentBlocks(changedItems, independentBlocks, sqlConnection, {
            success: function success() {
                tran.onerror.detach(_tranError);
                callback.success.apply(this, arguments);
            },
            error: function error() {
                tran.onerror.detach(_tranError);
                callback.error.apply(this, arguments);
            }
        }, tran);
    },
    saveIndependentBlocks: function saveIndependentBlocks(changedItems, independentBlocks, sqlConnection, callback, tran) {
        /// <summary>
        /// Saves the sequentially independent items to the database.
        /// </summary>
        /// <param name="independentBlocks">Array of independent block of items.</param>
        /// <param name="sqlConnection">sqlConnection to use</param>
        /// <param name="callback">Callback on finish</param>
        var provider = this;
        var t = [].concat(independentBlocks);
        function saveNextIndependentBlock(tran) {
            if (t.length === 0) {
                callback.success(tran);
                return;
            }
            var currentBlock = t.shift();
            // Converting items to their physical equivalent (?)
            var convertedItems = currentBlock.map(function (item) {
                var dbType = provider.context._storageModel.getStorageModel(item.data.getType()).PhysicalType;
                item.physicalData = dbType.convertTo(item.data);
                return item;
            }, this);
            try {
                provider.saveIndependentItems(convertedItems, sqlConnection, {
                    success: function success(items, tran) {
                        //TODO items???
                        provider.postProcessItems(convertedItems);
                        saveNextIndependentBlock(tran);
                    },
                    error: callback.error
                }, tran);
            } catch (e) {
                callback.error(e, tran);
            }
        }
        saveNextIndependentBlock(tran);
    },

    bulkInsert: function bulkInsert(entitySet, fields, datas, callback) {
        var pHandler = new _core2.default.PromiseHandler();
        callback = pHandler.createCallback(callback);

        var tableName = entitySet.tableName;
        var paramArr = [];
        fields.forEach(function (field, i) {
            paramArr.push('?');
        });

        var insertSqlString = "INSERT INTO [" + entitySet.tableName + "](";
        insertSqlString += fields.join(', ');
        insertSqlString += ') Values (';
        insertSqlString += paramArr.join(', ');
        insertSqlString += ');';

        var queries = [];
        for (var i = 0; i < datas.length; i++) {
            queries.push(insertSqlString);
        }

        var sqlConnection = this._createSqlConnection();
        var cmd = sqlConnection.createCommand(queries, datas);
        cmd.executeQuery({
            success: function success(raw) {
                callback.success(raw);
            },
            error: callback.error
        }, undefined, true);

        return pHandler.getPromise();
    },

    saveIndependentItems: function saveIndependentItems(items, sqlConnection, callback, tran) {
        var provider = this;
        var queries = items.map(function (item) {
            return provider.saveEntitySet(item);
        });
        queries = queries.filter(function (item) {
            return item;
        });
        if (queries.length === 0) {
            callback.success(items, tran);
            return;
        }
        function toCmd(sqlConnection, queries) {
            var cmdParams = { query: [], param: [] };
            queries.forEach(function (item, i) {
                if (item) {
                    if (item.query) cmdParams.query[i] = item.query;
                    if (item.param) cmdParams.param[i] = item.param;
                }
            });
            return sqlConnection.createCommand(cmdParams.query, cmdParams.param);
        }
        var cmd = toCmd(sqlConnection, queries);
        cmd.executeQuery({
            success: function success(results, tran) {
                var reloadQueries = results.map(function (result, i) {
                    if (result && result.insertId) {
                        return provider.save_reloadSavedEntity(result.insertId, items[i].entitySet.tableName, sqlConnection);
                    } else {
                        return null;
                    }
                });
                var cmd = toCmd(sqlConnection, reloadQueries);
                if (cmd.query.length > 0) {
                    cmd.executeQuery(function (results, tran) {
                        results.forEach(function (item, i) {
                            if (item && item.rows) {
                                items[i].physicalData.initData = item.rows[0];
                            }
                        });
                        callback.success(items, tran);
                    }, tran, true);
                } else {
                    callback.success(0, tran); //TODO Zenima: fixed this!
                }
            },
            error: callback.error
        }, tran, true);
    },
    postProcessItems: function postProcessItems(changedItems) {
        var pmpCache = {};
        function getPublicMappedProperties(type) {
            var key = type.name;
            if (pmpCache.hasOwnProperty(key)) return pmpCache[key];else {
                var pmp = type.memberDefinitions.getPublicMappedProperties().filter(function (memDef) {
                    return memDef.computed;
                });
                return pmpCache[key] = pmp;
            }
        }
        changedItems.forEach(function (item) {
            if (item.physicalData) {
                getPublicMappedProperties(item.data.getType()).forEach(function (memDef) {
                    item.data[memDef.name] = item.physicalData[memDef.name];
                }, this);
            }
        }, this);
    },

    saveEntitySet: function saveEntitySet(item) {
        switch (item.data.entityState) {
            case _core2.default.EntityState.Added:
                return this.save_NewEntity(item);break;
            case _core2.default.EntityState.Deleted:
                return this.save_DeleteEntity(item);break;
            case _core2.default.EntityState.Modified:
                return this.save_UpdateEntity(item);break;
            case _core2.default.EntityState.Unchanged:
                return;break;
            default:
                _core.Guard.raise(new _core.Exception('Not supported entity state'));
        }
    },
    save_DeleteEntity: function save_DeleteEntity(item) {
        ///DELETE FROM Posts WHERE Id=1;
        var deleteSqlString = "DELETE FROM [" + item.entitySet.tableName + "] WHERE(";
        var hasCondition = false;
        var addAllField = false;
        var deleteParam = [];
        while (!hasCondition) {
            item.physicalData.constructor.memberDefinitions.getPublicMappedProperties().forEach(function (fieldDef, i) {

                if (hasCondition && !deleteSqlString.match(" AND $")) {
                    deleteSqlString += " AND ";
                }
                if (fieldDef.key || addAllField) {
                    deleteSqlString += "([" + fieldDef.name + "] == ?)";
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function') {
                        deleteParam.push(logicalFieldDef.converter[this.providerName].toDb(item.data[logicalFieldDef.name], logicalFieldDef, this.context, logicalFieldDef.dataType));
                    } else {
                        deleteParam.push(this.fieldConverter.toDb[_core.Container.resolveName(fieldDef.dataType)](item.data[fieldDef.name]));
                    }
                    hasCondition = true;
                }
            }, this);
            if (!hasCondition) {
                addAllField = true;
            }
        }
        if (deleteSqlString.match(" AND $")) {
            deleteSqlString = deleteSqlString.slice(0, deleteSqlString.length - 5);
        }
        deleteSqlString += ");";
        return { query: deleteSqlString, param: deleteParam };
    },
    save_UpdateEntity: function save_UpdateEntity(item) {
        var setSection = " SET ";
        var whereSection = "WHERE(";

        var fieldsMaxIndex = item.entitySet.createNew.memberDefinitions.length;
        var hasCondition = false;
        var addAllField = false;
        var whereParam = [];
        var setParam = [];
        item.physicalData.constructor.memberDefinitions.getPublicMappedProperties().forEach(function (fieldDef, i) {
            if (item.physicalData[fieldDef.name] !== undefined) {
                if (hasCondition && !whereSection.match(" AND $")) {
                    whereSection += " AND ";
                }
                if (setSection.length > 5 && !setSection.match(',$')) {
                    setSection += ',';
                }
                if (fieldDef.key) {
                    whereSection += '([' + fieldDef.name + '] == ?)';
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function') {
                        whereParam.push(logicalFieldDef.converter[this.providerName].toDb(item.physicalData[logicalFieldDef.name], fieldDef, this.context, logicalFieldDef.dataType));
                    } else {
                        whereParam.push(this.fieldConverter.toDb[_core.Container.resolveName(fieldDef.dataType)](item.physicalData[fieldDef.name]));
                    }
                    hasCondition = true;
                } else {
                    var setValue = null;
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function') {
                        setValue = fieldDef.converter[this.providerName].toDb(item.physicalData[logicalFieldDef.name], logicalFieldDef, this.context, logicalFieldDef.dataType);
                    } else {
                        setValue = this.fieldConverter.toDb[_core.Container.resolveName(fieldDef.dataType)](item.physicalData[fieldDef.name]);
                    }

                    if (setValue != null) {
                        setSection += "[" + fieldDef.name + "] = ?";
                        setParam.push(setValue);
                    } else {
                        setSection += "[" + fieldDef.name + "] = " + _SqLiteCompiler.SqlStatementBlocks.NULLValue;
                    }
                }
            }
        }, this);
        if (!hasCondition) {
            _core.Guard.raise(new _core.Exception('Not supported UPDATE function without primary key!'));
        }

        if (whereSection.match(" AND $")) {
            whereSection = whereSection.slice(0, whereSection.length - 5);
        }
        if (setSection.match(",$")) {
            setSection = setSection.slice(0, setSection.length - 1);
        }
        var updateSqlString = "UPDATE [" + item.entitySet.tableName + "]" + setSection + " " + whereSection + ");";
        return { query: updateSqlString, param: setParam.concat(whereParam) };
    },
    save_NewEntity: function save_NewEntity(item) {
        var insertSqlString = "INSERT INTO [" + item.entitySet.tableName + "](";
        var fieldList = "";
        var fieldValue = "";
        var fieldParam = [];
        item.physicalData.constructor.memberDefinitions.getPublicMappedProperties().forEach(function (fieldDef, i) {
            if (fieldDef.key && !fieldDef.computed && _core.Guard.isNullOrUndefined(item.physicalData[fieldDef.name])) {
                _core.Guard.raise(new _core.Exception('Key is not set', 'Value exception', item));
                return;
            }
            if (fieldDef.key && fieldDef.computed && _core.Guard.isNullOrUndefined(item.physicalData[fieldDef.name])) {
                var typeName = _core.Container.resolveName(fieldDef.type);
                if (typeof this.supportedAutoincrementKeys[typeName] === 'function') {
                    item.physicalData[fieldDef.name] = this.supportedAutoincrementKeys[typeName]();
                }
            }

            if (fieldList.length > 0 && fieldList[fieldList.length - 1] != ",") {
                fieldList += ",";fieldValue += ",";
            }
            var fieldName = fieldDef.name;
            if ( /*item.physicalData[fieldName] !== null && */item.physicalData[fieldName] !== undefined) {
                if (fieldDef.dataType && (!fieldDef.dataType.isAssignableTo || fieldDef.dataType.isAssignableTo && !fieldDef.dataType.isAssignableTo(_core2.default.EntitySet))) {
                    fieldList += "[" + fieldName + "]";

                    var valueParam = null;
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function') {
                        valueParam = logicalFieldDef.converter[this.providerName].toDb(item.physicalData[fieldName], logicalFieldDef, this.context, logicalFieldDef.dataType);
                    } else {
                        valueParam = this.fieldConverter.toDb[_core.Container.resolveName(fieldDef.dataType)](item.physicalData[fieldName]);
                    }

                    if (valueParam === null) {
                        fieldValue += _SqLiteCompiler.SqlStatementBlocks.NULLValue;
                    } else {
                        fieldParam.push(valueParam);
                        fieldValue += '?';
                    }
                }
            }
        }, this);
        if (fieldParam.length < 1) {
            insertSqlString = "INSERT INTO [" + item.entitySet.tableName + "] Default values";
        } else {
            if (fieldList[fieldList.length - 1] == ",") {
                fieldList = fieldList.slice(0, fieldList.length - 1);
            }
            if (fieldValue[fieldValue.length - 1] == ",") {
                fieldValue = fieldValue.slice(0, fieldValue.length - 1);
            }
            insertSqlString += fieldList + ") VALUES(" + fieldValue + ");";
        }
        return { query: insertSqlString, param: fieldParam };
    },
    save_reloadSavedEntity: function save_reloadSavedEntity(rowid, tableName) {
        return { query: "SELECT * FROM " + tableName + " WHERE rowid=?", param: [rowid] };
    },
    createSqlFromStorageModel: function createSqlFromStorageModel(memberDef) {
        ///<param name="memberDef" type="$data.StorageModel">StorageModel object wich contains physical entity definition</param>
        if (memberDef === undefined || memberDef === null || memberDef.PhysicalType === undefined) {
            _core.Guard.raise("StorageModel not contains physical entity definition");
        }

        var keyFieldNumber = 0;
        var autoincrementFieldNumber = 0;

        memberDef.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (item, index) {

            if (item.key) {
                keyFieldNumber++;
            }
            if (item.computed) {
                //if (!item.key) {
                //    Guard.raise(new Exception('Only key field can be computed field!'));
                //}
                autoincrementFieldNumber++;
            }
        }, this);

        if (autoincrementFieldNumber === 1 && keyFieldNumber > 1) {
            _core.Guard.raise(new _core.Exception('Do not use computed field with multiple primary key!'));
        }
        if (autoincrementFieldNumber > 1 && keyFieldNumber > 1) {
            _core.Guard.raise(new _core.Exception('Do not use multiple computed field!'));
        }

        memberDef.PhysicalType.memberDefinitions.getKeyProperties().forEach(function (item, index) {
            var typeName = _core.Container.resolveName(item.type);
            if (item.computed && !(typeName in this.supportedAutoincrementKeys)) {
                console.log("WARRNING! '" + typeName + "' not supported as computed Key!");
            }
        }, this);

        var sql = "CREATE TABLE IF NOT EXISTS [" + memberDef.TableName + "] (";
        var pkFragment = ',PRIMARY KEY (';

        memberDef.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (item, index) {

            if (index > 0 && !sql.match(', $') && !sql.match('\\($')) sql += ', ';
            //var field = memberDef.createNew.memberDefinitions[fieldIndex];
            sql += this.createSqlFragmentFromField(item, autoincrementFieldNumber === 1, memberDef);
            if (autoincrementFieldNumber === 0 && item.key) {
                if (pkFragment.length > 14 && !pkFragment.match(', $')) pkFragment += ', ';
                pkFragment += "[" + item.name + "]";
            }
        }, this);

        if (sql.match(', $')) sql = sql.substr(0, sql.length - 2);
        if (autoincrementFieldNumber === 0 && pkFragment.length > 14) {
            sql += pkFragment + ')';
        }
        sql += ');';

        return sql;
    },
    createSqlIndexFromStorageModel: function createSqlIndexFromStorageModel(memberDef) {
        //Create indices
        var sql = "";
        var indices = [];
        if (memberDef.indices && memberDef.indices.length > 0) {
            for (var i = 0; i < memberDef.indices.length; i++) {
                sql = "";
                sql += "CREATE " + (memberDef.indices[i].unique ? "UNIQUE " : "") + "INDEX IF NOT EXISTS ";
                sql += memberDef.indices[i].name + " ON " + memberDef.TableName + " (";
                if (!memberDef.indices[i].keys || memberDef.indices[i].keys && memberDef.indices[i].keys.length < 1) {
                    throw new _core.Exception("Index create error: Keys field is required!");
                }
                for (var k = 0; k < memberDef.indices[i].keys.length; k++) {
                    if (k !== 0) {
                        sql += ", ";
                    }
                    var key = memberDef.indices[i].keys[k];
                    if (typeof key === "string") {
                        sql += key;
                    } else {
                        sql += key.fieldName;
                        if (key.order) {
                            sql += " " + key.order;
                        }
                    }
                }
                sql += ");";
                indices.push(sql);
            }
        }
        return indices;
    },
    createSqlFragmentFromField: function createSqlFragmentFromField(field, parsePk, storageModelObject) {
        if ('schemaCreate' in field && field['schemaCreate']) return field.schemaCreate(field);

        var fldBuilder = new this.FieldTypeBuilder(field, this, parsePk, storageModelObject);
        return fldBuilder.build();
    },
    FieldTypeBuilder: function FieldTypeBuilder(field, prov, parseKey, storageModelObject) {
        this.fieldDef = "";
        this.fld = field;
        this.provider = prov;
        this.parsePk = parseKey;
        this.entitySet = storageModelObject;
        this.build = function () {

            var typeName = _core.Container.resolveName(this.fld.dataType);
            var mapping = _core2.default.SqLiteProFieldMapping[typeName];

            if (mapping) {
                this.buildFieldNameAndType(mapping);
            } else {
                this.buildRelations();
            }

            return this.fieldDef;
        };
        this.buildFieldNameAndType = function (type) {
            this.fieldDef = "[" + this.fld.name + "] " + type;
            this.parsePk ? this.buildPrimaryKey() : this.buildNotNull();
        };
        this.buildPrimaryKey = function () {
            if (this.fld.key) {
                this.fieldDef += " PRIMARY KEY";

                var typeName = _core.Container.resolveName(this.fld.dataType);
                if (this.provider.supportedAutoincrementKeys[typeName] === true) {
                    this.buildAutoIncrement();
                }
            } else {
                this.buildNotNull();
            }
        };
        this.buildNotNull = function () {
            if (this.fld.required) this.fieldDef += " NOT NULL";
        };
        this.buildAutoIncrement = function () {
            if (this.fld.computed) this.fieldDef += " AUTOINCREMENT";
        };
    }
}, {
    isSupported: {
        get: function get() {
            return "openDatabase" in _core2.default.__global;
        },
        set: function set() {}
    }
});

if (_core2.default.storageProviders.sqLitePro.SqLiteStorageProvider.isSupported) {
    _core2.default.StorageProviderBase.registerProvider("webSql", _core2.default.storageProviders.sqLitePro.SqLiteStorageProvider);
    _core2.default.StorageProviderBase.registerProvider("sqLite", _core2.default.storageProviders.sqLitePro.SqLiteStorageProvider);
    _core2.default.webSqlProvider = _core2.default.storageProviders.sqLitePro.SqLiteStorageProvider;
}

},{"./SqLiteCompiler.js":10,"jaydata/core":"jaydata/core"}],13:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.sqLitePro.SqlExpressionMonitor', _core2.default.Expressions.ExpressionMonitor, null, {
    constructor: function constructor(monitorDefinition) {

        this.VisitIncludeExpression = function (expression, context) {
            var newSourceExpression = this.Visit(expression.source, context);
            monitorDefinition.isMapped = true;
            var newSelectorExpresion = this.Visit(expression.selector, context);
            monitorDefinition.isMapped = false;

            if (newSourceExpression !== expression.source || newSelectorExpresion !== expression.selector) {
                return _core.Container.createIncludeExpression(newSourceExpression, newSelectorExpresion);
            }
            return expression;
        };
        this.VisitProjectionExpression = function (expression, context) {
            var source = this.Visit(expression.source, context);
            monitorDefinition.isMapped = true;
            var selector = this.Visit(expression.selector, context);
            monitorDefinition.isMapped = false;
            if (source !== expression.source || selector !== expression.selector) {
                var expr = _core.Container.createProjectionExpression(source, selector, expression.params, expression.instance);
                expr.projectionAs = expression.projectionAs;
                return expr;
            }
            return expression;
        };
        this.VisitFrameOperationExpression = function (expression, context) {
            this.Visit(expression.source, context);
        };
    }

});

},{"./SqLiteCompiler.js":10,"jaydata/core":"jaydata/core"}],14:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.sqLitePro.SqlFilterCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    VisitParametricQueryExpression: function VisitParametricQueryExpression(expression, sqlBuilder) {
        this.Visit(expression.expression, sqlBuilder);
    },

    VisitUnaryExpression: function VisitUnaryExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLitePro.SqlBuilder"></param>
        sqlBuilder.addText(expression.resolution.mapTo);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
        this.Visit(expression.operand, sqlBuilder);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
    },

    VisitSimpleBinaryExpression: function VisitSimpleBinaryExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLitePro.SqlBuilder"></param>
        var self = this;

        if (expression.nodeType == "arrayIndex") {
            this.Visit(expression.left, sqlBuilder);
        } else {
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);

            //check null filter
            if (expression.left instanceof _core2.default.Expressions.EntityFieldExpression && expression.right instanceof _core2.default.Expressions.ConstantExpression && expression.right.value === null) {
                this.Visit(expression.left, sqlBuilder);
                sqlBuilder.addText(expression.resolution.nullMap);
            } else if (expression.right instanceof _core2.default.Expressions.EntityFieldExpression && expression.left instanceof _core2.default.Expressions.ConstantExpression && expression.left.value === null) {
                this.Visit(expression.right, sqlBuilder);
                sqlBuilder.addText(expression.resolution.nullMap);
            } else {
                this.Visit(expression.left, sqlBuilder);
                sqlBuilder.addText(" " + expression.resolution.mapTo + " ");

                if (expression.nodeType == "in") {
                    //TODO: refactor and generalize
                    _core.Guard.requireType("expression.right", expression.right, _core2.default.Expressions.ConstantExpression);
                    var set = expression.right.value;
                    if (set instanceof Array) {
                        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
                        set.forEach(function (item, i) {
                            if (i > 0) sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.valueSeparator);
                            self.Visit(item, sqlBuilder);
                        });
                        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
                    } else if (set instanceof _core2.default.Queryable) {
                        var subsql = set.toTraceString();
                        sqlBuilder.addText("(SELECT d FROM (" + subsql.sqlText.replace(new RegExp("(T[0-9]+(\.|\s|))", "g"), "SQ$1") + "))");
                        subsql.params.forEach(function (p) {
                            sqlBuilder.addParameter(p);
                        });
                        //Guard.raise("Not yet... but coming!");
                    } else {
                        _core.Guard.raise(new _core.Exception("Only constant arrays and Queryables can be on the right side of 'in' operator", "UnsupportedType"));
                    };
                } else {
                    this.Visit(expression.right, sqlBuilder);
                }
            }

            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
        }
    },

    VisitEntitySetExpression: function VisitEntitySetExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntitySetExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLitePro.SqlBuilder"></param>

        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.nameSeparator);
    },
    VisitEntityFieldOperationExpression: function VisitEntityFieldOperationExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntityFieldOperationExpression"></param>
        /// <param name="sqlBuilder"></param>

        //this.Visit(expression.operation);

        _core.Guard.requireType("expression.operation", expression.operation, _core2.default.Expressions.MemberInfoExpression);
        var opDefinition = expression.operation.memberDefinition;
        var opName = opDefinition.mapTo || opDefinition.name;
        var wrap = (opDefinition.wrap || "").split('@call');

        if (wrap.length > 0) sqlBuilder.addText(wrap[0]);
        sqlBuilder.addText(opName);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
        if (opName === "like") {
            var builder = _core2.default.sqLitePro.SqlBuilder.create([], sqlBuilder.entityContext);
            builder.selectTextPart("fragment");
            this.Visit(expression.parameters[0], builder);
            var fragment = builder.getTextPart("fragment");
            fragment.params.forEach(function (p) {
                var v = p;
                var paramDef = opDefinition.parameters[0];
                var v = paramDef.prefix ? paramDef.prefix + v : v;
                v = paramDef.suffix ? v + paramDef.suffix : v;
                sqlBuilder.addParameter(v);
            });
            sqlBuilder.addText(fragment.text);
            sqlBuilder.addText(" , ");
            this.Visit(expression.source, sqlBuilder);
        } else {
            if (opDefinition.type == "date") {
                var paramIndex = 0;
                for (var i = 0; i < opDefinition.parameters.length; i++) {
                    if (i > 0) sqlBuilder.addText(" , ");

                    var paramWrap = (opDefinition.parameters[i].wrap || "").split("@exp");
                    if (paramWrap.length > 0) sqlBuilder.addText(paramWrap[0]);
                    if (opDefinition.parameters[i].value) {
                        sqlBuilder.addText(opDefinition.parameters[i].value);
                    } else {
                        if (opDefinition.parameters[i].name == "@expression" && expression.source && expression.source.type != "object" && expression.source.value !== null) {
                            this.Visit(expression.source, sqlBuilder);
                        } else {
                            this.Visit(expression.parameters[paramIndex], sqlBuilder);
                            paramIndex++;
                        }
                    }
                    if (paramWrap.length > 1) sqlBuilder.addText(paramWrap[1]);
                }
                while (paramIndex < expression.parameters.length) {
                    sqlBuilder.addText(" , ");
                    this.Visit(expression.parameters[paramIndex], sqlBuilder);
                    paramIndex++;
                }
            } else {
                this.Visit(expression.source, sqlBuilder);
                expression.parameters.forEach(function (p) {
                    sqlBuilder.addText(" , ");
                    this.Visit(p, sqlBuilder);
                }, this);
            }
        };

        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
        if (wrap.length > 1) sqlBuilder.addText(wrap[1]);
    },
    VisitMemberInfoExpression: function VisitMemberInfoExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.MemberInfoExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLitePro.SqlBuilder"></param>

        sqlBuilder.addText(expression.memberName);
    },
    VisitQueryParameterExpression: function VisitQueryParameterExpression(expression, sqlBuilder) {
        var value = null;
        if (expression.type == "array") {
            value = expression.value[expression.index];
        } else {
            value = expression.value;
        }
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.parameter);
    },

    VisitConstantExpression: function VisitConstantExpression(expression, sqlBuilder) {
        //var typeNameHintFromValue = Container.getTypeName(expression.value);
        if (expression.type == Date) {
            expression.value = _core.Container.convertTo(expression.value, Number);
            expression.type = Number;
        }
        var value = sqlBuilder.entityContext.storageProvider.fieldConverter.toDb[_core.Container.resolveName(_core.Container.resolveType(expression.type))](expression.value);;
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.parameter);
    },

    VisitEntityFieldExpression: function VisitEntityFieldExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitComplexTypeExpression: function VisitComplexTypeExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
        sqlBuilder.addText("__");
    }
});

},{"./SqLiteCompiler.js":10,"jaydata/core":"jaydata/core"}],15:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.defaults = _core2.default.defaults || {};
_core2.default.defaults.sql = _core2.default.defaults.sql || {};
_core2.default.defaults.sql.orderCaseInsensitive = false;

(0, _core.$C)('$data.sqLitePro.SqlOrderCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor(provider) {
        this.provider = provider;
    },
    compile: function compile(expression, sqlBuilder) {
        this.Visit(expression, sqlBuilder);
    },
    VisitEntitySetExpression: function VisitEntitySetExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntitySetExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLitePro.SqlBuilder"></param>

        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.nameSeparator);
    },
    VisitOrderExpression: function VisitOrderExpression(expression, sqlBuilder) {
        this.Visit(expression.selector, sqlBuilder);
        if (_core2.default.defaults.sql.orderCaseInsensitive) {
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.collate_nocase);
        }

        if (expression.nodeType == _core2.default.Expressions.ExpressionType.OrderByDescending) {
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.desc);
        } else {
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.asc);
        }
    },
    VisitGroupExpression: function VisitGroupExpression(expression, sqlBuilder) {
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitParametricQueryExpression: function VisitParametricQueryExpression(expression, sqlBuilder) {
        this.Visit(expression.expression, sqlBuilder);
    },
    VisitSimpleBinaryExpression: function VisitSimpleBinaryExpression(expression, sqlBuilder) {
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);

        if (expression.left instanceof _core2.default.Expressions.EntityFieldExpression && expression.right instanceof _core2.default.Expressions.ConstantExpression && expression.right.value === null) {
            this.Visit(expression.left, sqlBuilder);
            sqlBuilder.addText(expression.resolution.nullMap);
        } else if (expression.right instanceof _core2.default.Expressions.EntityFieldExpression && expression.left instanceof _core2.default.Expressions.ConstantExpression && expression.left.value === null) {
            this.Visit(expression.right, sqlBuilder);
            sqlBuilder.addText(expression.resolution.nullMap);
        } else {
            this.Visit(expression.left, sqlBuilder);
            var self = this;
            sqlBuilder.addText(" " + expression.resolution.mapTo + " ");
            if (expression.nodeType == "in") {
                //TODO: refactor and generalize
                _core.Guard.requireType("expression.right", expression.right, _core2.default.Expressions.ConstantExpression);
                var set = expression.right.value;
                if (set instanceof Array) {
                    sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
                    set.forEach(function (item, i) {
                        if (i > 0) sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.valueSeparator);
                        var c = _core.Container.createConstantExpression(item);
                        self.Visit(c, sqlBuilder);
                    });
                    sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
                } else if (set instanceof _core2.default.Queryable) {
                    _core.Guard.raise("not yet... but coming");
                } else {
                    _core.Guard.raise(new _core.Exception("Only constant arrays and Queryables can be on the right side of 'in' operator", "UnsupportedType"));
                };
            } else {
                this.Visit(expression.right, sqlBuilder);
            }
        }
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
    },
    VisitConstantExpression: function VisitConstantExpression(expression, sqlBuilder) {
        if (expression.type == Date) {
            expression.value = _core.Container.convertTo(expression.value, Number);
            expression.type = Number;
        }
        var value = expression.value;
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.parameter);
    },
    VisitEntityFieldExpression: function VisitEntityFieldExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitMemberInfoExpression: function VisitMemberInfoExpression(expression, sqlBuilder) {
        sqlBuilder.addText(expression.memberName);
    },
    VisitComplexTypeExpression: function VisitComplexTypeExpression(expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
        sqlBuilder.addText('__');
    },
    VisitEntityFieldOperationExpression: function VisitEntityFieldOperationExpression(expression, sqlBuilder) {
        var compiler = _core2.default.sqLitePro.SqlProjectionCompiler.create();
        compiler.Visit(expression, sqlBuilder);
    }
});

},{"./SqLiteCompiler.js":10,"jaydata/core":"jaydata/core"}],16:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.sqLitePro.SqlPagingCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor(provider) {
        this.provider = provider;
    },
    compile: function compile(expression, context) {
        this.Visit(expression, context);
    },
    VisitPagingExpression: function VisitPagingExpression(expression, sqlBuilder) {
        this.Visit(expression.amount, sqlBuilder);
    },
    VisitConstantExpression: function VisitConstantExpression(expression, sqlBuilder) {
        sqlBuilder.addParameter(expression.value);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.parameter);
    }
});

},{"./SqLiteCompiler.js":10,"jaydata/core":"jaydata/core"}],17:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _core.$C)('$data.sqLitePro.SqlProjectionCompiler', _core2.default.Expressions.EntityExpressionVisitor, null, {
    constructor: function constructor() {
        this.anonymFiledPrefix = "";
        this.currentObjectLiteralName = null;
    },
    VisitProjectionExpression: function VisitProjectionExpression(expression, sqlBuilder) {
        this.Visit(expression.selector, sqlBuilder);
    },

    VisitParametricQueryExpression: function VisitParametricQueryExpression(expression, sqlBuilder) {
        if (expression.expression instanceof _core2.default.Expressions.EntityExpression) {
            if (!sqlBuilder.getTextPart("distinct")) {
                this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
                sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + _SqLiteCompiler.SqlStatementBlocks.rowIdName + ", ");
            }
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        } else if (expression.expression instanceof _core2.default.Expressions.EntitySetExpression) {
            if (!sqlBuilder.getTextPart("distinct")) {
                this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
                sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + _SqLiteCompiler.SqlStatementBlocks.rowIdName + ", ");
            }
            this.anonymFiledPrefix = sqlBuilder.getExpressionAlias(expression.expression) + '__';
            this.MappedFullEntitySet(expression.expression, sqlBuilder);
        } else if (expression.expression instanceof _core2.default.Expressions.ObjectLiteralExpression) {
            if (!sqlBuilder.getTextPart("distinct")) {
                this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
                sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + _SqLiteCompiler.SqlStatementBlocks.rowIdName + ", ");
            }
            this.Visit(expression.expression, sqlBuilder);
        } else {
            if (!sqlBuilder.getTextPart("distinct")) {
                this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
                sqlBuilder.addText("rowid");
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.as);
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.rowIdName);
                sqlBuilder.addText(', ');
                sqlBuilder.addKeyField(_SqLiteCompiler.SqlStatementBlocks.rowIdName);
            }
            this.Visit(expression.expression, sqlBuilder);
            if (!(expression.expression instanceof _core2.default.Expressions.ComplexTypeExpression)) {
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.as);
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.scalarFieldName);
            }
        }
    },

    VisitEntityExpressionAsProjection: function VisitEntityExpressionAsProjection(expression, sqlBuilder) {
        var ee = expression.expression;
        var alias = sqlBuilder.getExpressionAlias(ee.source);

        var localPrefix = this.anonymFiledPrefix + (expression.fieldName ? expression.fieldName : '');
        localPrefix = localPrefix ? localPrefix + '__' : '';

        ee.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberInfo, index) {
            if (index > 0) {
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.valueSeparator);
            }

            var fieldName = localPrefix + memberInfo.name;

            sqlBuilder.addText(alias);
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(memberInfo.name);
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.as);
            sqlBuilder.addText(fieldName);
        }, this);
    },

    VisitEntityFieldOperationExpression: function VisitEntityFieldOperationExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntityFieldOperationExpression"></param>
        /// <param name="sqlBuilder"></param>

        _core.Guard.requireType("expression.operation", expression.operation, _core2.default.Expressions.MemberInfoExpression);
        var opDefinition = expression.operation.memberDefinition;
        var opName = opDefinition.mapTo || opDefinition.name;
        var wrap = (opDefinition.wrap || "").split('@call');

        if (wrap.length > 0) sqlBuilder.addText(wrap[0]);
        sqlBuilder.addText(opName);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
        if (opName === "like") {
            var builder = _core2.default.sqLitePro.SqlBuilder.create();
            this.Visit(expression.parameters[0], builder);
            builder.params.forEach(function (p) {
                var v = p;
                var paramDef = opDefinition.parameters[0];
                var v = paramDef.prefix ? paramDef.prefix + v : v;
                v = paramDef.suffix ? v + paramDef.suffix : v;
                sqlBuilder.addParameter(v);
            });
            sqlBuilder.addText(builder.sql);
            sqlBuilder.addText(" , ");
            this.Visit(expression.source, sqlBuilder);
        } else {
            if (opDefinition.type == "date") {
                var paramIndex = 0;
                for (var i = 0; i < opDefinition.parameters.length; i++) {
                    if (i > 0) sqlBuilder.addText(" , ");

                    var paramWrap = (opDefinition.parameters[i].wrap || "").split("@exp");
                    if (paramWrap.length > 0) sqlBuilder.addText(paramWrap[0]);
                    if (opDefinition.parameters[i].value) {
                        sqlBuilder.addText(opDefinition.parameters[i].value);
                    } else {
                        if (opDefinition.parameters[i].name == "@expression" && expression.source && expression.source.type != "object" && expression.source.value !== null) {
                            this.Visit(expression.source, sqlBuilder);
                        } else {
                            this.Visit(expression.parameters[paramIndex], sqlBuilder);
                            paramIndex++;
                        }
                    }
                    if (paramWrap.length > 1) sqlBuilder.addText(paramWrap[1]);
                }
                while (paramIndex < expression.parameters.length) {
                    sqlBuilder.addText(" , ");
                    this.Visit(expression.parameters[paramIndex], sqlBuilder);
                    paramIndex++;
                }
            } else {
                this.Visit(expression.source, sqlBuilder);
                expression.parameters.forEach(function (p) {
                    sqlBuilder.addText(" , ");
                    this.Visit(p, sqlBuilder);
                }, this);
            }
        };

        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
        if (wrap.length > 1) sqlBuilder.addText(wrap[1]);
    },

    VisitUnaryExpression: function VisitUnaryExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLitePro.SqlBuilder"></param>
        sqlBuilder.addText(expression.resolution.mapTo);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
        this.Visit(expression.operand, sqlBuilder);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
    },

    VisitSimpleBinaryExpression: function VisitSimpleBinaryExpression(expression, sqlBuilder) {
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
        this.Visit(expression.left, sqlBuilder);
        var self = this;
        sqlBuilder.addText(" " + expression.resolution.mapTo + " ");
        if (expression.nodeType == "in") {
            //TODO: refactor and generalize
            _core.Guard.requireType("expression.right", expression.right, _core2.default.Expressions.ConstantExpression);
            var set = expression.right.value;
            if (set instanceof Array) {
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.beginGroup);
                set.forEach(function (item, i) {
                    if (i > 0) sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.valueSeparator);
                    var c = _core.Container.createConstantExpression(item);
                    self.Visit(c, sqlBuilder);
                });
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
            } else if (set instanceof _core2.default.Queryable) {
                _core.Guard.raise("not yet... but coming");
            } else {
                _core.Guard.raise(new _core.Exception("Only constant arrays and Queryables can be on the right side of 'in' operator", "UnsupportedType"));
            };
        } else {
            this.Visit(expression.right, sqlBuilder);
        }
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.endGroup);
    },

    VisitConstantExpression: function VisitConstantExpression(expression, sqlBuilder) {
        if (expression.type == Date) {
            expression.value = _core.Container.convertTo(expression.value, Number);
            expression.type = Number;
        }
        var value = expression.value;
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.parameter);
    },

    VisitEntityFieldExpression: function VisitEntityFieldExpression(expression, sqlBuilder) {
        if (expression.source instanceof _core2.default.Expressions.ComplexTypeExpression) {
            var alias = sqlBuilder.getExpressionAlias(expression.source.source.source);
            var storageModel = expression.source.source.storageModel.ComplexTypes[expression.source.selector.memberName];
            var typeName = _core.Container.resolveType(expression.source.selector.memberDefinition.type).name;
            var member = storageModel.ReferentialConstraint.filter(function (item) {
                return item[typeName] == expression.selector.memberName;
            })[0];
            if (!member) {
                _core.Guard.raise(new _core.Exception('Compiler error! ComplexType does not contain ' + expression.source.selector.memberName + ' property!'));return;
            }

            sqlBuilder.addText(alias);
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(member[storageModel.From]);
        } else {
            this.Visit(expression.source, sqlBuilder);
            this.Visit(expression.selector, sqlBuilder);
        }
    },

    VisitEntitySetExpression: function VisitEntitySetExpression(expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.nameSeparator);
    },

    VisitComplexTypeExpression: function VisitComplexTypeExpression(expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression.source.source);
        var storageModel = expression.source.storageModel.ComplexTypes[expression.selector.memberName];
        storageModel.ReferentialConstraint.forEach(function (constrain, index) {
            if (index > 0) {
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.valueSeparator);
            }
            sqlBuilder.addText(alias);
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(constrain[storageModel.From]);
            sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.as);
            sqlBuilder.addText(this.anonymFiledPrefix + constrain[storageModel.To]);
        }, this);
    },

    VisitMemberInfoExpression: function VisitMemberInfoExpression(expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.MemberInfoExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLitePro.SqlBuilder"></param>
        sqlBuilder.addText(expression.memberName);
    },

    VisitObjectLiteralExpression: function VisitObjectLiteralExpression(expression, sqlBuilder) {
        var membersNumber = expression.members.length;
        for (var i = 0; i < membersNumber; i++) {
            if (i != 0) {
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.valueSeparator);
            }
            this.Visit(expression.members[i], sqlBuilder);
        }
    },
    MappedFullEntitySet: function MappedFullEntitySet(expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression);
        var properties = expression.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties();
        properties.forEach(function (prop, index) {
            if (!prop.association) {
                if (index > 0) {
                    sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.valueSeparator);
                }
                sqlBuilder.addText(alias);
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.nameSeparator);
                sqlBuilder.addText(prop.name);
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.as);
                sqlBuilder.addText(this.anonymFiledPrefix + prop.name);
            }
        }, this);
        //ToDo: complex type
    },
    VisitObjectFieldExpression: function VisitObjectFieldExpression(expression, sqlBuilder) {

        var tempObjectLiteralName = this.currentObjectLiteralName;
        if (this.currentObjectLiteralName) {
            this.currentObjectLiteralName += '.' + expression.fieldName;
        } else {
            this.currentObjectLiteralName = expression.fieldName;
        }

        if (expression.expression instanceof _core2.default.Expressions.EntityExpression) {
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        } else {

            var tmpPrefix = this.anonymFiledPrefix;
            this.anonymFiledPrefix += expression.fieldName + "__";

            if (expression.expression instanceof _core2.default.Expressions.EntitySetExpression) {
                this.MappedFullEntitySet(expression.expression, sqlBuilder);
            } else {
                this.Visit(expression.expression, sqlBuilder);
            }

            this.anonymFiledPrefix = tmpPrefix;

            if (!(expression.expression instanceof _core2.default.Expressions.ObjectLiteralExpression) && !(expression.expression instanceof _core2.default.Expressions.ComplexTypeExpression) && !(expression.expression instanceof _core2.default.Expressions.EntitySetExpression)) {
                sqlBuilder.addText(_SqLiteCompiler.SqlStatementBlocks.as);
                sqlBuilder.addText(this.anonymFiledPrefix + expression.fieldName);
            }
        }
        this.currentObjectLiteralName = tempObjectLiteralName;
    }

}, null);

},{"./SqLiteCompiler.js":10,"jaydata/core":"jaydata/core"}],18:[function(_dereq_,module,exports){
'use strict';

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.Class.define('$data.sqLitePro.SqlTransaction', _core2.default.Transaction, null, {
    abort: function abort() {
        _core2.default.Trace.log("onabort: ", this._objectId);
        if (typeof this.transaction.rollBack === 'function') this.transaction.rollBack();else {
            _core.Guard.raise(new _core.Exception('User Abort', 'Exception', arguments));
        }
    }
}, null);

},{"./SqLiteCompiler.js":10,"jaydata/core":"jaydata/core"}],19:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = _dereq_('jaydata/core');

var _core2 = _interopRequireDefault(_core);

var _DbCommand = _dereq_('../../../../jaydata/src/Types/DbClient/DbCommand.js');

var _DbCommand2 = _interopRequireDefault(_DbCommand);

var _DbConnection = _dereq_('../../../../jaydata/src/Types/DbClient/DbConnection.js');

var _DbConnection2 = _interopRequireDefault(_DbConnection);

var _OpenDbCommand = _dereq_('../../../../jaydata/src/Types/DbClient/OpenDatabaseClient/OpenDbCommand.js');

var _OpenDbCommand2 = _interopRequireDefault(_OpenDbCommand);

var _OpenDbConnection = _dereq_('../../../../jaydata/src/Types/DbClient/OpenDatabaseClient/OpenDbConnection.js');

var _OpenDbConnection2 = _interopRequireDefault(_OpenDbConnection);

var _JayStorageCommand = _dereq_('../../../../jaydata/src/Types/DbClient/JayStorageClient/JayStorageCommand.js');

var _JayStorageCommand2 = _interopRequireDefault(_JayStorageCommand);

var _JayStorageConnection = _dereq_('../../../../jaydata/src/Types/DbClient/JayStorageClient/JayStorageConnection.js');

var _JayStorageConnection2 = _interopRequireDefault(_JayStorageConnection);

var _SqLiteNjCommand = _dereq_('../../../../jaydata/src/Types/DbClient/SqLiteNjClient/SqLiteNjCommand.js');

var _SqLiteNjCommand2 = _interopRequireDefault(_SqLiteNjCommand);

var _SqLiteNjConnection = _dereq_('../../../../jaydata/src/Types/DbClient/SqLiteNjClient/SqLiteNjConnection.js');

var _SqLiteNjConnection2 = _interopRequireDefault(_SqLiteNjConnection);

var _SqLiteConverter = _dereq_('./SqLiteConverter.js');

var _SqLiteConverter2 = _interopRequireDefault(_SqLiteConverter);

var _SqLiteCompiler = _dereq_('./SqLiteCompiler.js');

var _SqLiteCompiler2 = _interopRequireDefault(_SqLiteCompiler);

var _SqlPagingCompiler = _dereq_('./SqlPagingCompiler.js');

var _SqlPagingCompiler2 = _interopRequireDefault(_SqlPagingCompiler);

var _SqlOrderCompiler = _dereq_('./SqlOrderCompiler.js');

var _SqlOrderCompiler2 = _interopRequireDefault(_SqlOrderCompiler);

var _SqlProjectionCompiler = _dereq_('./SqlProjectionCompiler.js');

var _SqlProjectionCompiler2 = _interopRequireDefault(_SqlProjectionCompiler);

var _SqlExpressionMonitor = _dereq_('./SqlExpressionMonitor.js');

var _SqlExpressionMonitor2 = _interopRequireDefault(_SqlExpressionMonitor);

var _SqlFilterCompiler = _dereq_('./SqlFilterCompiler.js');

var _SqlFilterCompiler2 = _interopRequireDefault(_SqlFilterCompiler);

var _sqLite_ModelBinderCompiler = _dereq_('./ModelBinder/sqLite_ModelBinderCompiler.js');

var _sqLite_ModelBinderCompiler2 = _interopRequireDefault(_sqLite_ModelBinderCompiler);

var _SqlTransaction = _dereq_('./SqlTransaction.js');

var _SqlTransaction2 = _interopRequireDefault(_SqlTransaction);

var _SqLiteStorageProvider = _dereq_('./SqLiteStorageProvider.js');

var _SqLiteStorageProvider2 = _interopRequireDefault(_SqLiteStorageProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//provider


//dbCommand
exports.default = _core2.default;
module.exports = exports['default'];

},{"../../../../jaydata/src/Types/DbClient/DbCommand.js":1,"../../../../jaydata/src/Types/DbClient/DbConnection.js":2,"../../../../jaydata/src/Types/DbClient/JayStorageClient/JayStorageCommand.js":3,"../../../../jaydata/src/Types/DbClient/JayStorageClient/JayStorageConnection.js":4,"../../../../jaydata/src/Types/DbClient/OpenDatabaseClient/OpenDbCommand.js":5,"../../../../jaydata/src/Types/DbClient/OpenDatabaseClient/OpenDbConnection.js":6,"../../../../jaydata/src/Types/DbClient/SqLiteNjClient/SqLiteNjCommand.js":7,"../../../../jaydata/src/Types/DbClient/SqLiteNjClient/SqLiteNjConnection.js":8,"./ModelBinder/sqLite_ModelBinderCompiler.js":9,"./SqLiteCompiler.js":10,"./SqLiteConverter.js":11,"./SqLiteStorageProvider.js":12,"./SqlExpressionMonitor.js":13,"./SqlFilterCompiler.js":14,"./SqlOrderCompiler.js":15,"./SqlPagingCompiler.js":16,"./SqlProjectionCompiler.js":17,"./SqlTransaction.js":18,"jaydata/core":"jaydata/core"}]},{},[19])(19)
});

