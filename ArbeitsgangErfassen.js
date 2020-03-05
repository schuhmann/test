define("app/admin/ArbeitsgangErfassen", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane",
    "dojo/text!./templates/ArbeitsgangErfassen.html",
    "dojo/on",
    "dojo/store/Memory",
    "dojo/_base/window",
    "dojo/_base/array",
    "dojo/request",
    "dijit/registry",
    "dijit/form/Button",
    "dijit/form/Form",
    "dijit/form/NumberTextBox",
    "dijit/form/FilteringSelect",
    "dijit/form/SimpleTextarea",
    "dojo/domReady!"
], function (declare, lang, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin,
        ContentPane, temp, on, Memory, win, array, request, registry) {
    var app = win.global.app,
        Bv_land_zwingendStore = new Memory({
            data: [
                {id: "nein", name: "nein"},
                {id: "ja", name: "ja"},
                {id: "CH", name: "CH"}
            ]
        }),
        bereichStore = new Memory({
            data: [
                {id: "Montage / Restleistungen", name: "Montage / Restleistungen"},
                {id: "Restarbeiten", name: "Restarbeiten"},
                {id: "Kundendienst", name: "Kundendienst"},
                {id: "Musterhaus", name: "Musterhaus"},
                {id: "Technik", name: "Technik"},
                {id: "Sonstiges", name: "Sonstiges"},
                {id: "Vorbelegung", name: "Vorbelegung"}
            ]
        });
    return declare(ContentPane, {
        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);
            this.ArbeitsgangErfassenForm = new(declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
                templateString: temp,
                editRow: null
            }))();
            this.ArbeitsgangErfassenForm.startup();
            this.content = this.ArbeitsgangErfassenForm;
        },
        postCreate: function () {
            var eingabe = this.content;
            this.inherited(arguments);
            on(this.ArbeitsgangErfassenForm, "submit", function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
            });
            array.forEach([
                {"btn": "btnAgnrSuchen", "tb": "agnr", "col": "agnr"},
                {"btn": "btnNameSuchen", "tb": "name", "col": "name"},
                {"btn": "btnBereichSuchen", "tb": "bereich", "col": "bereich"},
                {"btn": "btnBv_land_zwingendSuchen", "tb": "bvlandzwingend", "col": "bvlandzwingend"},
                {"btn": "btnKostenstelleSuchen", "tb": "kostenstelle", "col": "kostenstell"},
                {"btn": "btnLa_chSuchen", "tb": "lach", "col": "lach"},
                {"btn": "btnLa_deSuchen", "tb": "lade", "col": "lade"},
                {"btn": "btnLa_de_chSuchen", "tb": "ladech", "col": "ladech"},
                {"btn": "btnAbteilungSuchen", "tb": "abteilung", "col": "abteilungid"}
            ], function (entry) {
                on(eingabe[entry.btn], "click", function () {
                    var obj = {}, b = "", AdminTabGrid = registry.byId("adminArbeitsgangGrid");
                    if ((entry.tb === "pruefer") || (entry.tb === "chmonteur")) {
                        b = eingabe[entry.tb].get("displayedValue");
                    } else {
                        b = eingabe[entry.tb].get("value");
                    }
                    lang.setObject(entry.col, new RegExp(b, "i"), obj);
                    //lang.setObject(entry.col, b, obj);
                    if (b) {
                        AdminTabGrid.set("query", obj);
                    } else {
                        AdminTabGrid.set("query", {});
                    }
                });
            });
            eingabe.bv_land_zwingend.set({
                "store": Bv_land_zwingendStore,
                "placeHolder": "",
                "searchAttr": "name",
                "autoComplete": true
            });
            this.content.abteilung.set({
                "store": new Memory({idProperty: "id"}),
                "placeHolder": "Abteilung auswählen !",
                "searchAttr": "abteilung",
                "autoComplete": true
            });
            eingabe.bereich.set({
                "store": bereichStore,
                "placeHolder": "",
                "searchAttr": "name",
                "autoComplete": true
            });
            eingabe.agnr.set("disabled", false);
            eingabe.kostenstelle.set("disabled", false);
            eingabe.la_ch.set("disabled", false);
            eingabe.la_de.set("disabled", false);
            eingabe.la_de_ch.set("disabled", false);
            eingabe.abteilung.set("disabled", false);
            request.get(app.RequestUrl + "abteilungen/", {
                timeout: 5000,
                preventCache: true,
                handleAs: "json"
            }).then(
                function (res) {
                    eingabe.abteilung.store.setData(res);
                }
            );
        }
    });
});
