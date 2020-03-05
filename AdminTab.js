define("app/admin/AdminTab", [
    "dojo/_base/declare",
    "dijit/layout/BorderContainer",
    "dijit/layout/StackContainer",
    "dijit/MenuBar",
    "dijit/MenuBarItem",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/on",
    "dojo/request",
    "app/admin/ArbeitsgangGrid",
    "app/admin/BenutzerGrid",
    "app/admin/BauvorhabenGrid",
    "dojo/store/Memory",
    "dojo/domReady!"
], function (declare, BorderContainer, StackContainer, Mb, Mbi,
        domConstruct, array, on, request, ArbeitsgangGrid, BenutzerGrid, BauvorhabenGrid, Memory) {
    var topMb = new Mb({
            id: "menueOben",
            region: "top",
            style: "overflow:hidden;padding: 0px;width: 100%;border-left: 0px;border-right: 0px;"
        }),
        sc = new StackContainer({
            region: "center",
            splitter: false
        }),
        bGrid = new BenutzerGrid({
            className: "benutzerGrid",
            store: new Memory({data: [], idProperty: "id"})
        }),
        aGrid = new ArbeitsgangGrid({
            className: "arbeitsgangGrid",
            store: new Memory({data: [], idProperty: "id"})
        }),
        bvGrid = new BauvorhabenGrid({
            className: "bauvorhabenGrid"
        }),
        btnBe = new Mbi({
            label: "<b>&nbsp;Benutzer</b>",
            iconClass: "dijitIcon dijitIconEditProperty",
            onClick: function () {
                sc.selectChild(bGrid);
                var deferred = request.get("benutzer/alle", {
                    timeout: 5000,
                    preventCache: true,
                    handleAs: "json"
                });
                deferred.then(function (res) {
                    bGrid.set("store", new Memory({data: res, idProperty: "id"}));
                    bGrid.set("sort", "persnr");
                }, function (err) {
                    // This shouldn't occur, but it's defined just in case
                    windows.alert("An error occurred: " + err);
                });
            }
        }),
        btnAg = new Mbi({
            label: "<b>&nbsp;Arbeitsgänge</b>",
            iconClass: "dijitIcon dijitIconEditProperty",
            selected: "selected",
            onClick: function () {
                sc.selectChild(aGrid);
                var deferred = request.get("arbeitsgang/alle", {
                    timeout: 5000,
                    preventCache: true,
                    handleAs: "json"
                });
                deferred.then(function (res) {
                    aGrid.set("collection", new Memory({data: res, idProperty: "id"}));
                    aGrid.set("sort", "agnr");
                }, function (err) {
                    // This shouldn't occur, but it's defined just in case
                    alert("An error occurred: " + err);
                });
            }
        }),
        btnBv = new Mbi({
            label: "<b>&nbsp;Bauvorhaben</b>",
            iconClass: "dijitIcon dijitIconEditProperty",
            onClick: function () {
                sc.selectChild(bvGrid);
                bvGrid.set("sort", "baunr");
            }
        });
    sc.addChild(bGrid);
    sc.addChild(aGrid);
    sc.addChild(bvGrid);
    return declare(BorderContainer, {
        id: "adminTab",
        iconClass: "dijitIcon dijitIconDatabase",
        style: "margin: 0px;padding: 0px;border: 0px;",
        splitter: false,
        gutters: false,
        title: "&nbsp;Verwaltung",
        postCreate: function () {
            this.inherited(arguments);
            on(this, "submit", function (evt) {
                // prevent the page from navigating after submit
                evt.stopPropagation();
                evt.preventDefault();
            });
            sc.selectChild(aGrid);
            var deferred = request.get("arbeitsgang/alle", {
                timeout: 5000,
                preventCache: true,
                handleAs: "json"
            });
            deferred.then(function (res) {
                aGrid.set("store", new Memory({data: res, idProperty: "id"}));
                aGrid.set("sort", "agnr");
            }, function (err) {
                // This shouldn't occur, but it"s defined just in case
                alert("An error occurred: " + err);
            });
            array.forEach([btnAg, btnBe, btnBv], function (item) {
                if (item.get("iconClass")) {
                    domConstruct.create("span", {
                        className: "dijitReset dijitInline dijitIcon " + item.get("iconClass")
                    }, item.domNode.childNodes[0], "before");
                }
                topMb.addChild(item);
            });
            this.addChild(topMb);
            sc.startup();
            this.addChild(sc);
            //this.addChild(bottomMb);
        }
    });
});
