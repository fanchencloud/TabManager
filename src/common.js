export const TabItem = function () {
    this.id = "";
    this.title = "";
    this.url = "";
}

export var WorkSpaceItem = function () {
    this.fid = "";            // 主键ID
    this.workSpaceName = "";  // 工作区名称
    this.saveDataTime = "";   // 保存时间
    this.spaceTabs = [];      // 工作区中的页面
}

// %USERPROFILE%\AppData\Local\Google\Chrome\User Data\Default\IndexedDB
export const dbUtil = {
    db: {},
    initDB: (successFun) => {
        const request = window.indexedDB.open("tabsWorkSpaceDB", 2);
        request.onerror = function (event) {
            console.log("打开DB失败", event);
        }
        request.onupgradeneeded = function (event) {
            console.log("DB升级中...");
            const db = event.target.result;
            if (!db.objectStoreNames.contains("workSpace")) {
                const objectStore = db.createObjectStore("workSpace", {
                    keyPath: "fid"
                });
                objectStore.createIndex('fid', 'fid', {
                    unique: true
                });
            }
            if (!db.objectStoreNames.contains("tokenStore")) {
                const githubTokenStore = db.createObjectStore("tokenStore", {
                    keyPath: "fid"
                });
                githubTokenStore.createIndex('fid', 'fid', {
                    unique: true
                });
            }
            console.log("DB升级中完成!");
            // onupgradeneeded 执行完后会再到 onsuccess 的
        };
        request.onsuccess = function (event) {
            dbUtil.db = event.target.result;
            if (successFun) {
                successFun();
            }
        }
    },
    getObjStore: () => {
        return dbUtil.db.transaction(["workSpace"], "readwrite").objectStore("workSpace");
    },
    getTokenStore: () => {
        return dbUtil.db.transaction(["tokenStore"], "readwrite").objectStore("tokenStore");
    },
    updateSyncToken: strToken => {
        const tokenObj = {};
        tokenObj.fid = "githubToken";
        tokenObj.strToken = strToken;
        dbUtil.getTokenStore().put(tokenObj);
    },
    getSyncToken: callbackFn => {
        const request = dbUtil.getTokenStore().get("githubToken");
        request.onerror = function (event) {
            callbackFn();
        }
        request.onsuccess = function (event) {
            const tokenObj = request.result;
            if (tokenObj) {
                callbackFn(tokenObj.strToken);
            } else {
                callbackFn();
            }
        }
    },
    updateSyncFileId: strFileId => {
        const gistObj = {};
        gistObj.fid = "gistId";
        gistObj.strGistObj = strFileId;
        dbUtil.getTokenStore().put(gistObj);
    },
    getSyncFileId: callbackFn => {
        const request = dbUtil.getTokenStore().get("gistId");
        request.onerror = function (event) {
            callbackFn();
        }
        request.onsuccess = function (event) {
            const gistObj = request.result;
            if (gistObj) {
                callbackFn(gistObj.strGistObj);
            } else {
                callbackFn();
            }
        }
    },
    del: fid => {
        dbUtil.getObjStore().delete(fid);
    },
    save: workSpaceItem => {
        dbUtil.getObjStore().put(workSpaceItem);
    },
    findById: (fid, callbackFn) => {
        const request = dbUtil.getObjStore().get(fid);
        request.onerror = function (event) {
            callbackFn();
        }
        request.onsuccess = function (event) {
            callbackFn(request.result);
        }
    },
    /**
     * 通过fid查询工作区
     * @param fid {string} 工作区id
     * @returns {Promise<WorkSpaceItem>}
     */
    findById2: (fid) => {
        const request = dbUtil.getObjStore().get(fid)
        return new Promise((resolve, reject) => {
            request.onerror = function (event) {
                resolve(null);
            }
            request.onsuccess = function (event) {
                resolve(request.result);
            }
        }).catch(e => {
            console.log(e);
        })
    },
    findAll: callbackFn => {
        const workSpaceItems = {};
        dbUtil.getObjStore().openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                workSpaceItems[cursor.key] = cursor.value;
                cursor.continue();
            } else {
                callbackFn(workSpaceItems);
            }
        };
    }
};
