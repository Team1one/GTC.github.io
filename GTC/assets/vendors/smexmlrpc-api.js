/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function smexml_conn(domain, relative_path = "") {
    this.domain = domain || "";
    this.relative_path = relative_path || "";
    this.headers = { 'Content-Type': 'text/xml; charset=UTF-8' };
    this.time_out = 15 * 1000;
}

function smexml_api(connection) {
    this.connectivity = connection;
    this.dbname = undefined;
    this.uid = "uidAAA";
    this.pwd = "pwdAAA";
}

smexml_api.prototype.postRequest = function (
    methodName,
    params,
    dbname = undefined,
    callback = {
        onSuccess: () => { },
        onError: () => { },
    }) {
    return this.subscribeRequest(methodName, params, dbname, callback);
};

smexml_api.prototype.promiseRequest = function (
    methodName,
    params,
    dbname = undefined,
    callback = {
        onSuccess: () => { },
        onError: () => { },
    }) {
    var conn = this.connectivity;
    endpoint = (conn.domain || "") + "/" + (conn.relative_path || "");
    endpoint = ("" + endpoint).replace(/\/\//g, '//');
    params = params || [];
    if (dbname) params.unshift(dbname);
    var promise = new Promise(function (resolve, reject) {
        $.xmlrpc({
            headers: conn.headers,
            url: endpoint || "",
            timeout: conn.time_out,
            methodName: methodName || "",
            params: params,
            success: function (response, status, jqXHR) {
                if (response[0]) {
                    console.log(919, "smexml_api.postRequest.success.response", response);
                    console.log(919, "smexml_api.postRequest.success.status", status);
                    console.log(919, "smexml_api.postRequest.success.jqXHR", jqXHR);
                    if (callback && callback.onSuccess) { callback.onSuccess(response); }
                    resolve(response[0]);
                } else {
                    console.log(919, "smexml_api.postRequest.success.reject");
                    if (callback && callback.onError) { callback.onError(error); }
                    reject();
                }
            },
            error: function (jqXHR, status, error) {
                console.log(919, "smexml_api.postRequest.error.error", error);
                console.log(919, "smexml_api.postRequest.error.status", status);
                console.log(919, "smexml_api.postRequest.error.jqXHR", jqXHR);
                if (callback && callback.onError) { callback.onError(error); }
                reject(error);
            }
        });
    });
    return promise;
};

smexml_api.prototype.subscribeRequest = function (
    methodName,
    params,
    dbname = undefined,
    callback = {
        onSuccess: () => { },
        onError: () => { },
    }) {
    var conn = this.connectivity;
    endpoint = (conn.domain || "") + "/" + (conn.relative_path || "");
    endpoint = ("" + endpoint).replace(/\/\//g, '//');
    params = params || [];
    if (dbname) params.unshift(dbname);
    var promise = Rx.Observable.create(observer => {
        $.xmlrpc({
            headers: conn.headers,
            url: endpoint || "",
            timeout: conn.time_out,
            methodName: methodName || "",
            params: params,
            success: function (response, status, jqXHR) {
                if (response[0]) {
                    console.log(919, "smexml_api.postRequest.success.response", response);
                    console.log(919, "smexml_api.postRequest.success.status", status);
                    console.log(919, "smexml_api.postRequest.success.jqXHR", jqXHR);
                    if (callback && callback.onSuccess) { callback.onSuccess(response); }
                    observer.next(response[0]);
                } else {
                    console.log(919, "smexml_api.postRequest.success.reject");
                    if (callback && callback.onError) { callback.onError(error); }
                    observer.error({
                        "code": "error parse response",
                        "type": "error parse response",
                        "message": "no response",
                        "msg": "no response found"
                    });
                }
            },
            error: function (jqXHR, status, error) {
                console.log(919, "smexml_api.postRequest.error.error", error);
                console.log(919, "smexml_api.postRequest.error.status", status);
                console.log(919, "smexml_api.postRequest.error.jqXHR", jqXHR);
                if (callback && callback.onError) { callback.onError(error); }
                observer.error(error);
            }
        });
    });
    return promise;
};


// ====================================
// RemicleAPI Client code
// ====================================

var RemicleAPI = {
    api: new smexml_api(new smexml_conn("http://umobile.remicle.com")),
    dbName: "test",
    usn: undefined,
    uid: undefined,
    pwd: undefined,
    login: function (usn, pwd) {
        this.api.connectivity.relative_path = "xmlrpc/common";
        var params = [usn, pwd];
        callback = {
            onSuccess: (response) => {
                RemicleAPI.usn = usn;
                RemicleAPI.pwd = pwd;
            },
            onError: (error) => {
                RemicleAPI.usn = usn;
                RemicleAPI.pwd = pwd;
            },
        }
        return this.api.postRequest("login", params, this.dbName, callback);
    },
    about: function () {
        this.api.connectivity.relative_path = "xmlrpc/common";
        return this.api.postRequest("about", [], this.dbName);
    },

    version: function () {
        this.api.connectivity.relative_path = "xmlrpc/common";
        return this.api.postRequest("version", [], this.dbName);
    },
    authenticate: function (params) {
        this.api.connectivity.relative_path = "xmlrpc/common";
        return this.api.postRequest("login", params, this.dbname);
    },
    create: function (params) {
        this.api.connectivity.relative_path = "xmlrpc/object";
        var secret1 = "res.partner";
        var secret2 = "create";
        var params = [this.uid, this.pwd, secret1, secret2];
        return this.api.postRequest("execute", params, this.dbname);
    },
    search: function (params) {
        this.api.connectivity.relative_path = "xmlrpc/object";
        var secret1 = "res.partner";
        var secret2 = "search";
        var params = [this.uid, this.pwd, secret1, secret2];
        return this.api.postRequest("execute", params, this.dbname);
    },
    read: function (params) {
        this.api.connectivity.relative_path = "xmlrpc/object";
        var secret1 = "res.partner";
        var secret2 = "read";
        var params = [this.uid, this.pwd, secret1, secret2];
        return this.api.postRequest("execute", params, this.dbname);
    },
    write: function (params) {
        this.api.connectivity.relative_path = "xmlrpc/object";
        var secret1 = "res.partner";
        var secret2 = "write";
        var params = [this.uid, this.pwd, secret1, secret2];
        return this.api.postRequest("execute", params, this.dbname);
    },
    runTestSuite() {
        var onFulfilled = {
            onSuccess: (id, response) => {
                console.log(919, "RemicleAPI." + id, "xmlrpc.response" + " >> " + JSON.stringify(response));
            },
            onError: (id, error) => {
                console.log(919, "RemicleAPI." + id, "xmlrpc.error" + " >> " + JSON.stringify(error));
            },
        }

        RemicleAPI.login("haha", "haha123")
            .subscribe(
            function (response) { onFulfilled.onSuccess("login", response) },
            function (error) { onFulfilled.onError("login", error) }
            );

        RemicleAPI.about()
            .subscribe(
            function (response) { onFulfilled.onSuccess("about", response) },
            function (error) { onFulfilled.onError("about", error) }
            );

        RemicleAPI.version()
            .subscribe(
            function (response) { onFulfilled.onSuccess("version", response) },
            function (error) { onFulfilled.onError("version", error) }
            );

        RemicleAPI.authenticate()
            .subscribe(
            function (response) { onFulfilled.onSuccess("authenticate", response) },
            function (error) { onFulfilled.onError("authenticate", error) }
            );

        RemicleAPI.create()
            .subscribe(
            function (response) { onFulfilled.onSuccess("create", response) },
            function (error) { onFulfilled.onError("create", error) }
            );

        RemicleAPI.search()
            .subscribe( 
            function (response) { onFulfilled.onSuccess("search", response) },
            function (error) { onFulfilled.onError("search", error) }
            );

        RemicleAPI.read()
            .subscribe(
            function (response) { onFulfilled.onSuccess("read", response) },
            function (error) { onFulfilled.onError("read", error) }
            );

        RemicleAPI.write()
            .subscribe(
            function (response) { onFulfilled.onSuccess("write", response) },
            function (error) { onFulfilled.onError("write", error) }
            );
    }
} 