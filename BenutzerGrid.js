define("app/admin/BenutzerGrid", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dgrid/OnDemandGrid",
    "dgrid/extensions/DijitRegistry",
    "dgrid/Selection",
    "dgrid/Keyboard",
    "dgrid/extensions/Pagination",
    "dgrid/extensions/CompoundColumns",
    "dojo/html",
    "dojo/store/Memory",
    "dijit/form/Button",
    "dojo/dom-construct",
    "app/admin/BenutzerErfassen",
    "dojo/request",
    "dojo/json",
    "dojo/_base/window",
    "xstyle/css!app/admin/css/benutzerGrid.css",
    "dojo/domReady!"
],function (declare, lang, Grid, DijitRegistry, Selection, Keyboard, Pagination, CompoundColumns,
        html, Memory, Btn, domConstruct, BenutzerErfassen, request, JSON, win) {
        var app = win.global.app,
        btnAdd = new Btn({
            label: "<b>&nbsp;Neu</b>",
            iconClass: "dijitIcon dijitIconNewTask"
        }),
        btnSave = new Btn({
            label: "<b>&nbsp;Speichern</b>",
            iconClass: "dijitIcon dijitIconSave"
        }),
        btnAbort = new Btn({
            label: "<b>&nbsp;Abbrechen</b>",
            disabled: true,
            iconClass: "dijitIcon dijitIconUndo"
        }),
        btnDel = new Btn({
            label: "<b>&nbsp;Löschen</b>",
            iconClass: "dijitIcon dijitIconCut"
        }),
        formEr = new BenutzerErfassen({
            style: "height: 100%;overflow:hidden;"
        }),
        reqData = function (newId, eingabe) {
            var newObj = {
                tab_montagearbeiten: (eingabe.tab_montagearbeiten.checked) ? 1 : 0,
                tab_montagedrucken: (eingabe.tab_montagedrucken.checked) ? 1 : 0,
                tab_regie: (eingabe.tab_regie.checked) ? 1 : 0,
                tab_technik: (eingabe.tab_technik.checked) ? 1 : 0,
                tab_lohnbuchhaltung: (eingabe.tab_lohnbuchhaltung.checked) ? 1 : 0,
                tab_verwalten: (eingabe.tab_verwalten.checked) ? 1 : 0,
                tab_auswertung: (eingabe.tab_auswertung.checked) ? 1 : 0,
                tab_auswertungbv: (eingabe.tab_auswertungbv.checked) ? 1 : 0,
                tab_serviceauftrag: (eingabe.tab_serviceauftrag.checked) ? 1 : 0,
                tab_bauleiter: (eingabe.tab_bauleiter.checked) ? 1 : 0,
                persnr : eingabe.persnr.get('value'),
                hhch: eingabe.chmonteur.get('value'),
                azubi: eingabe.azubi.get('value'),
                aktiv: eingabe.aktiv.get('value'),
                auswertung: eingabe.ausabteilung.get('value'),
                name : eingabe.name.get('value') || "",
                vorname : eingabe.vorname.get('value') || "",
                pruefer : eingabe.pruefer.get('value'),
                abteilungs_id : eingabe.abteilung.get('value')
            };
            if (newId > 0) {lang.setObject("id", newId, newObj); }
            return JSON.stringify(newObj);
        },
			benutzerGrid = declare([Grid, Selection, Keyboard, DijitRegistry, Pagination, CompoundColumns], {
				region: "center",
				splitter: false,
				id: "adminBenutzerGrid",
				className: "benutzerGrid",
				selectionMode: "single",
				deselectOnRefresh: false,
				getBeforePut: false,
				sort: ['persnr'],
				columns: [
					{ label: "Benutzer verwalten", children: [
						{label: "PersNr.",	field: "persnr", sortable: false},
						{label: "Name", field: "name", sortable: false},
						{label: "Vorname", field: "vorname", sortable: false},
                        {label: "Aktiv", field: "aktiv", sortable: false},
						{label: "Abt.", field: "abteilungs_id", sortable: false},
						{label: "Abteilungs Name", field: "abteilung", sortable: false},
						{label: "HH CH", field: "hhch", sortable: false},
						{label: "Azubi", field: "azubi", sortable: false},
						{label: "Prüfer", field: "pruefer", sortable: false}
					]}
				],
				rowsPerPage: 15,
				showFooter: true,
				store : new Memory({data: [], idProperty: "id"}),
				eingabeForm : null,
				setHead: function (e) {
					if (this.oben) {
						html.set(this.oben, e);
					}
				},
				buildRendering: function () {
					this.inherited(arguments);
					this.actionNode =
						domConstruct.create("div", {
							className: "dgrid-action"
						}, this.footerNode);
					this.gridFormNode =
						domConstruct.create("div", {
							className: "dgrid-eingabe"
						}, this.headerNode, "first");
				},
				postCreate: function () {
					var grid = this, eingabe = formEr.content;
					this.inherited(arguments);
					formEr.placeAt(this.gridFormNode);
					btnAdd.placeAt(this.actionNode);
					btnSave.placeAt(this.actionNode);
					btnAbort.placeAt(this.actionNode);
					btnDel.placeAt(this.actionNode);
					this.on("dgrid-select", function (evt) {
						var item = evt.rows[0].data;
						eingabe.editRow = item;
						eingabe.tab_montagearbeiten.set('checked', item.tab_montagearbeiten);
						eingabe.tab_montagedrucken.set('checked', item.tab_montagedrucken);
						eingabe.tab_regie.set('checked', item.tab_regie);
						eingabe.tab_technik.set('checked', item.tab_technik);
						eingabe.tab_lohnbuchhaltung.set('checked', item.tab_lohnbuchhaltung);
						eingabe.tab_verwalten.set('checked', item.tab_verwalten);
						eingabe.tab_auswertung.set('checked', item.tab_auswertung);
						eingabe.tab_auswertungbv.set('checked', item.tab_auswertungbv);
	                    eingabe.tab_serviceauftrag.set('checked', item.tab_serviceauftrag);
                        eingabe.tab_bauleiter.set('checked', item.tab_bauleiter);
    					eingabe.persnr.set('value', item.persnr);
						eingabe.persnr.set("disabled", true);
						eingabe.chmonteur.set('displayedValue', item.hhch);
						eingabe.azubi.set('displayedValue', item.azubi);
                        eingabe.aktiv.set('displayedValue', item.aktiv);
						eingabe.ausabteilung.set('displayedValue', eingabe.ausabteilung.store.get(item.auswertung).abteilung);
						eingabe.name.set('value', item.name);
						eingabe.vorname.set('value', item.vorname);
						eingabe.pruefer.set('displayedValue', item.pruefer);
						eingabe.abteilung.set('value', item.abteilungs_id);
					});
					btnAdd.on("click", function () {
						eingabe.editRow = null;
						eingabe.tab_montagearbeiten.set('checked', 0);
						eingabe.tab_montagedrucken.set('checked', 0);
						eingabe.tab_regie.set('checked', 0);
						eingabe.tab_technik.set('checked', 0);
						eingabe.tab_lohnbuchhaltung.set('checked', 0);
						eingabe.tab_verwalten.set('checked', 0);
						eingabe.tab_auswertung.set('checked', 0);
						eingabe.tab_auswertungbv.set('checked', 0);
                        eingabe.tab_serviceauftrag.set('checked', 0);
                        eingabe.tab_bauleiter.set('checked',0);
						eingabe.persnr.set('value', "");
						eingabe.persnr.set("disabled", false);
						eingabe.persnr.set("required", true);
						eingabe.chmonteur.set('value', 0);
						eingabe.azubi.set('value', 0);
                        eingabe.aktiv.set('value', 0);
						eingabe.ausabteilung.set('value', 0);
						eingabe.name.set('value', "");
						eingabe.name.set("required", true);
						eingabe.vorname.set('value', "");
						eingabe.vorname.set("required", true);
						eingabe.pruefer.set('value', 0);
						eingabe.abteilung.set('value', "");
						eingabe.abteilung.set("required", true);
						eingabe.persnr.set('disabled', false);
						eingabe.persnr.focus();
						btnAdd.set("disabled", true);
						btnDel.set("disabled", true);
						btnAbort.set("disabled", false);
						btnSave.set("disabled", false);
					});
					btnSave.on("click", function () {
            			if (eingabe.BenutzerErfassen.validate()) {
							if (!eingabe.editRow) {
								if (grid.store.query({persnr: eingabe.persnr.get('value')})[0]) {
									app.MsgBox.set('content', "Personalnummer schon vorhanden");
									app.MsgBox.set('title', "Fehler !");
									app.MsgBox.show();
									return;
								}
								console.log(eingabe)
								request.post(app.RequestUrl + "benutzer/add", {
									timeout: 5000,
									data: reqData(0, eingabe),
									preventCache: true,
									handleAs: "json"
								}).then(
									function (res) {
										if (res !== 0) {
											var p = grid.get('_currentPage'),
												r = grid.get('_rowsOnPage');
											if (r === grid.get('rowsPerPage')) {
												p++;
											}
											grid.store.put(res);
											grid.select(res.id);
											grid.refresh();
											//grid.gotoPage(p);
											eingabe.editRow = res;
											grid.set("selectionMode", "single");
											btnAdd.set("disabled", false);
											btnDel.set("disabled", false);
											btnAbort.set("disabled", true);
											btnSave.set("disabled", false);
										} else {
											app.MsgBox.set('content', "Personalnummer schon vorhanden");
											app.MsgBox.set('title', "Fehler !");
											app.MsgBox.show();
										}
									}
								);
							} else {
   							request.put(app.RequestUrl + "benutzer/put", {
									timeout: 5000,
									data: reqData(eingabe.editRow.id, eingabe),
									preventCache: true,
									handleAs: "json"
								}).then(
									function (res) {
										if (res !== 0) {
											grid.store.put(res);
											grid.refresh();
											//grid.gotoPage(p);
											eingabe.editRow = res;
											grid.set("selectionMode", "single");
											btnAdd.set("disabled", false);
											btnDel.set("disabled", false);
											btnAbort.set("disabled", true);
											btnSave.set("disabled", false);
										}
									}
								);
							}
						} else {
							app.MsgBox.set('content', "Bitte alle Felder ausfüllen");
							app.MsgBox.set('title', "Fehler !");
							app.MsgBox.show();
							return false;
						}
					});
					btnAbort.on("click", function () {
						eingabe.editRow = null;
						btnAdd.set("disabled", false);
						btnDel.set("disabled", false);
						btnAbort.set("disabled", true);
						btnSave.set("disabled", false);
					});
					btnDel.on("click", function () {
						var id = 0, i;
						for (i in grid.selection) {
							if (grid.selection.hasOwnProperty(i)) {
								id = i;
							}
						}
						if (id === 0) {return; }
						request.del(app.RequestUrl + "benutzer/del/" + id, {
							timeout: 5000,
							preventCache: true,
							handleAs: "json"
						}).then(
							function (res) {
								if (res !== 0) {
									var p = grid.get('_currentPage'),
										r = grid.get('_rowsOnPage');
									if (r === 1) {
										p--;
									}
									grid.store.remove(id);
									grid.refresh();
									grid.gotoPage(p);
								}
							}
						);
					});
				}
			});
		return benutzerGrid;
	});
