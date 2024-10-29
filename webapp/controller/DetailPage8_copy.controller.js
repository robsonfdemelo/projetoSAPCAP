sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./Dialog11",
    "./utilities",
    "sap/ui/core/routing/History",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "../libs/jszip",
    "../libs/xlsx",
    'sap/ui/model/Sorter',
    'sap/ui/model/Filter'
], function (BaseController, MessageBox, Dialog11, Utilities, History, Export, ExportTypeCSV, exportLibrary, Spreadsheet, jszipjs, xlsxjs, Sorter, Filter) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    var excelImported = "";
    return BaseController.extend("com.sap.build.standard.adminEngine.controller.DetailPage8_copy", {
        handleRouteMatched: function (oEvent) {
            var sAppId = "App5f74baded5dbc32ead99b868";

            var oParams = {};

            if (oEvent.mParameters.data.context) {
                this.sContext = oEvent.mParameters.data.context;

            } else {
                if (this.getOwnerComponent().getComponentData()) {
                    var patternConvert = function (oParam) {
                        if (Object.keys(oParam).length !== 0) {
                            for (var prop in oParam) {
                                if (prop !== "sourcePrototype" && prop.includes("Set")) {
                                    return prop + "(" + oParam[prop][0] + ")";
                                }
                            }
                        }
                    };

                    this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
                }
            }

            var oPath;

            if (this.sContext) {
                oPath = {
                    path: "/" + this.sContext,
                    parameters: oParams
                };
                this.getView().bindObject(oPath);
            }

        },
        /*_onOverflowToolbarButtonPress: function (oEvent) {

            var sDialogName = "Dialog15";
            this.mDialog11 = this.mDialog11 || {};
            var oDialog = this.mDialog11[sDialogName];
            if (!oDialog) {
                oDialog = new Dialog11(this.getView());
                this.mDialog11[sDialogName] = oDialog;

                // For navigation.
                oDialog.setRouter(this.oRouter);
            } else {
                this.getView().byId("uf").setValue("");
                this.getView().byId("codIBGE").setValue("");
                this.getView().byId("bloqueada").setValue("");
            }

            var context = oEvent.getSource().getBindingContext();
            oDialog._oControl.setBindingContext(context);

            oDialog.open();

        },*/

        onAfterRendering: function (oEvent) {
            var that = this;
        },

        onBeforeRendering: function (oEvent) {
            var that = this;
        },

        onInit: function () {
            this.customUfFilter = []
            this.customCodIbgeFilter = []
            this.customBloqueadaFilter = []
            this.customFilterRegiaoBloq = []

            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getTarget("DetailPage4").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            var oView = this.getView();
            var sampleModel = new sap.ui.model.json.JSONModel();
            oView.setModel(sampleModel, "sampleModel");

            var columnModel = new sap.ui.model.json.JSONModel();
            oView.setModel(columnModel, "columnModel");
            //this.localModel = new sap.ui.model.json.JSONModel();
            //this.getView().setModel(this.localModel, "/BOM");

            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/",
            });
            //  oModel.setSizeLimit(999999999999);
            oView.setModel(oModel);
            // var oListBinding = oModel.bindList("/BOM", undefined, undefined, undefined, { $select: "idTipoOS" });
            //  var count = 0;
            //  oListBinding.requestContexts().then(function (aContexts) {
            //     var oData = [];
            //      aContexts.forEach(function (oContext) {
            //         oData.push(oContext.getObject());
            //         count = count + 1;
            //    });
            //     var oModelo = new sap.ui.model.json.JSONModel({
            //         "results": oData
            //     });
            //     oView.setModel(oModelo);
            //    count = "Items (" + count + ")";
            //   oView.byId("titleCount").setText(count);
            //  });
            oView.getController().setHeaderContext();
            oView.addEventDelegate({
                onBeforeShow: function () {
                    if (sap.ui.Device.system.phone) {
                        var oPage = oView.getContent()[0];
                        if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
                            oPage.setShowNavButton(true);
                            oPage.attachNavButtonPress(function () {
                                this.oRouter.navTo("MasterPage1", {}, true);
                            }.bind(this));
                        }
                    }
                }.bind(this)
            });

        },
        onDataExport: function (oEvent) {
            var oListBinding = this.getView().getModel().bindList("/UfBloqueada", undefined, undefined, undefined, { $select: "*" });
            var oData = [];
            oListBinding.requestContexts().then(function (aContexts) {
                aContexts.forEach(function (oContext) {
                    oData.push(oContext.getObject());
                });

                var oModelo = new sap.ui.model.json.JSONModel({
                    "results": oData
                });
                var oExport = new Export({
                    // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                    exportType: new ExportTypeCSV({
                        separatorChar: ";"
                    }),

                    // Pass in the model created above
                    models: oModelo,

                    // binding information for the rows aggregation
                    rows: {
                        path: "/results"
                    },

                    // column definitions with column name and binding info for the content

                    columns: [{
                        name: "Tipo de WO",
                        template: {
                            content: "{tipoWo}"
                        }
                    }]
                });

                // download exported file
                oExport.saveFile().catch(function (oError) {
                    window.alert("deu erro");
                    //	MessageToast.show("Error when downloading data. Browser might not be supported!\n\n" + oError);
                }).then(function () {
                    oExport.destroy();
                });
            });
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                // label: 'Tipo de Inst.',
                property: 'uf',
                type: EdmType.String
            });

            aCols.push({
                // label: 'Tipo de Inst.',
                property: 'codIBGE',
                type: EdmType.String
            });

            aCols.push({
                // label: 'Tipo de Inst.',
                property: 'bloqueada',
                type: EdmType.String
            });

            return aCols;
        },
        onExport: function () {
            //    if (excelImported == "") {
            this.onExportOdataV4();
            //   } else {
            //       this.onExportJson();
            //   };
        },
        onExportJson: function () {
            var aCols, aData, oSettings, oSheet;

            aCols = this.createColumnConfig();
            aData = this.getView().getModel().getProperty('/');

            oSettings = {
                workbook: { columns: aCols },
                dataSource: aData.TipoWoBaixaAutomatica,
                fileName: 'Tipo de WO.xlsx'
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    //  MessageToast.show('Spreadsheet export has finished');
                })
                .finally(oSheet.destroy);
        },
        onExportOdataV4: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId('regioTable');
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');

            aCols = this.createColumnConfig();

            var oModel = oRowBinding.getModel();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: {
                    type: 'odata',
                    dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
                    serviceUrl: this._sServiceUrl,
                    headers: oModel.getHttpHeaders ? oModel.getHttpHeaders() : null,
                    count: oRowBinding.getLength ? oRowBinding.getLength() : null,
                    useBatch: true, // Default for ODataModel V2
                    sizeLimit: 1000
                },
                fileName: 'Regiões Bloqueadas UF.xlsx',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        /* Function to Upload the file*/
        onhandleUpload: function (oEvent) {
            var that = this;
            var oFileUploader = that.getView().byId("FileUploaderid");
            var oFile = oFileUploader.getFocusDomRef().files[0];
            //To check the File type of uploaded File.
            if (oFile.type === "application/vnd.ms-excel") {
                //To call the CSV File Function
                that.typeCsv();
            } else {
                //To call the XLSX File Function
                that.typeXLSX();
            }
        },
        typeCsv: function () {
            var that = this;
            var oFileUploader = that.getView().byId("FileUploaderid");
            var oFile = oFileUploader.getFocusDomRef().files[0];
            if (oFile && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var strData = evt.target.result;
                    that.csvJSON(strData);
                    that.getView().getModel("sampleModel").refresh(true);
                };
                reader.onerror = function (exe) {
                    //	console.log(exe);
                };
                reader.readAsText(oFile);

            }

        },
        csvJSON: function (csv) {
            var that = this;
            var lines = csv.split("\n");
            var result = [];
            var colheaders = lines[0].split(",");
            for (var i = 1; i < lines.length; i++) {
                var obj = {};
                var currentline = lines[i].split(",");
                for (var j = 0; j < colheaders.length; j++) {
                    obj[colheaders[j]] = currentline[j];
                }
                result.push(obj);
            }
            that.getView().getModel().setProperty("/", result);
            that.generateTableCsv();
        },
        /*	Function to create the table dynamically for csv File*/
        generateTableCsv: function () {
            var that = this;
            var oTable = that.getView().byId("regioTable");
            var oModel = that.getView().getModel();
            var oModelData = oModel.getProperty("/");
            var ColumnsData = Object.keys(oModelData[0]);
            var oColumnNames = [];
            $.each(ColumnsData, function (i, value) {
                oColumnNames.push({
                    Text: ColumnsData[i]
                });
            });
            oModel.setProperty("/columnNames", oColumnNames);
            var columnmodel = that.getView().getModel("columnModel");
            columnmodel.setProperty("/", oColumnNames);
            var oTemplate = new sap.m.Column({
                header: new sap.m.Label({
                    text: "{Text}"
                })
            });
            oTable.bindAggregation("columns", "/columnNames", oTemplate);
            var oItemTemplate = new sap.m.ColumnListItem();
            var oTableHeaders = oTable.getColumns();
            $.each(oTableHeaders, function (j, value) {
                var oHeaderName = oTableHeaders[j].getHeader().getText();
                oItemTemplate.addCell(new sap.m.Text({
                    text: "{" + oHeaderName + "}"
                }));
            });
            oTable.bindAggregation("items", {
                path: "/",
                template: oItemTemplate

            });

        },
        typeXLSX: function () {
            var that = this;
            var oFileUploader = that.getView().byId("FileUploaderid");
            var file = oFileUploader.getFocusDomRef().files[0];
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var data = evt.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    });
                    that.getView().getModel("sampleModel").setData(excelData);
                    that.getView().getModel("sampleModel").refresh(true);
                    that.generateTablexlsx();
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },
        /*Function to create the table Dynamically for xlsx file*/
        generateTablexlsx: function () {
            var that = this;
            var oTable = that.getView().byId("regioTable");
            var oModel = that.getView().getModel("sampleModel");
            var oModelData = oModel.getProperty("/");
            var oColumns = Object.keys(oModelData[0]);
            var oColumnNames = [];
            $.each(oColumns, function (i, value) {
                oColumnNames.push({
                    Text: oColumns[i]
                });
            });
            var columnmodel = that.getView().getModel("columnModel");
            columnmodel.setProperty("/", oColumnNames);
            var oTemplate = new sap.m.Column({
                header: new sap.m.Label({
                    text: "{columnModel>Text}"
                })
            });
            oTable.bindAggregation("columns", "columnModel>/", oTemplate);
            var oItemTemplate = new sap.m.ColumnListItem();
            var oTableHeaders = oTable.getColumns();
            $.each(oTableHeaders, function (j, value) {
                var oHeaderName = oTableHeaders[j].getHeader().getText();
                oItemTemplate.addCell(new sap.m.Text({
                    text: "{sampleModel>" + oHeaderName + "}"
                }));
            });
            oTable.bindAggregation("items", {
                path: "sampleModel>/",
                template: oItemTemplate
            });
        },
        onUpload: function (e) {
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },

        _import: function (file) {
            var that = this;
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        // Here is your object for every sheet in workbook
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

                    });
                    // Setting the data to the local model 
                    //	that.localModel.setData({
                    //		BOM: excelData
                    //	});
                    //	that.localModel.refresh(true);
                    var oModelo = new sap.ui.model.json.JSONModel({
                        UfBloqueada: excelData
                    });
                    var oModelData = oModelo.getProperty("/");
                    var oColumns = Object.keys(oModelData["UfBloqueada"][0]);
                    if (oColumns[0] == "uf" && oColumns[1] == "codIBGE") {
                        var oGlobalBusyDialog = new sap.m.BusyDialog();
                        oGlobalBusyDialog.open();
                        var oModel = that.getView().getModel();
                        var oListBinding = oModel.bindList("/importUfBloqueada", undefined, undefined, undefined, { $$updateGroupId: "UfBloqExcel" });

                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        oListBinding.attachCreateCompleted(function (oEvent) {
                            oGlobalBusyDialog.close();
                            if (oEvent.getParameter("success")) {
                                MessageBox.show(
                                    "Dados importados com sucesso", {
                                    icon: MessageBox.Icon.SUCCESS,
                                    title: "Dados gravados!",
                                    onClose: function (oAction) {
                                        var oTable = that.getView().byId("regioTable"),
                                            oBinding = oTable.getBinding("items"),
                                            aFilters = [];
                                        oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                                        oBinding.filter(aFilters);
                                    }
                                }
                                );
                            } else {
                                sap.m.MessageBox.show(
                                    sap.ui.getCore().getMessageManager().getMessageModel().getData()[0].message,
                                    sap.m.MessageBox.Icon.ERROR,
                                    "Erro ao realizar o upload!"
                                );
                                that.byId("regioTable").getBinding("items").resetChanges();
                                //   sap.ui.getCore().getMessageManager().removeAllMessages();
                            }
                        }.bind(this));
                        //var  oContext = "";
                        var oData = [];
                        $.each(excelData, function (index, value) {
                            oData.push({
                                "uf": value.uf,
                                "codIBGE": value.codIBGE,
                                "bloqueada": value.bloqueada
                            });
                        });
                        var oContext = oListBinding.create({
                            "uf": oData
                        }, true);

                        if (excelData.length > 0) {
                            //that.onSave();
                            //that.onInit();
                            that.getView().getModel().submitBatch("UfBloqExcel");

                        }
                    } else {
                        sap.m.MessageBox.show(
                            "O Layout do arquivo está incorreto. Realize o download e tente novamente.",
                            sap.m.MessageBox.Icon.ERROR,
                            "Erro no upload do arquivo"
                        );
                    }
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },

        onResetChanges: function () {
            this.byId("regioTable").getBinding("items").resetChanges();

        },
        onDelete: function (oEvent) {
            //var oSelected = this.byId("bomTable").getSelectedItem();
            var oList = oEvent.getSource(),
                oItem = oEvent.getParameter("listItem");
            var that = this;
            if (oItem) {
                oItem.getBindingContext().delete("$auto").then(function () {
                    //   window.alert("deu certo");
                    sap.m.MessageBox.show(
                        "Registro excluido com sucesso!",
                        sap.m.MessageBox.Icon.SUCCESS,
                        "Dados gravados!"
                    );
                    that.getView().getController().setHeaderContext();
                }.bind(this), function (oError) {
                    //  window.alert("deu erro");
                    sap.m.MessageBox.show(
                        "Tente novamente.",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao deletar o registro."
                    );
                });
            }
        },
        setHeaderContext: function () {
            var oView = this.getView();
            oView.byId("titleCount").setBindingContext(
                oView.byId("regioTable").getBinding("items").getHeaderContext());
        },

        onDeleteUFBloq: function () {
            var that = this;
            MessageBox.warning("Tem certeza que seja excluir toda a lista? É recomendado realizar o download dos dados antes de prosseguir", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        var oGlobalBusyDialog = new sap.m.BusyDialog();
                        oGlobalBusyDialog.open();
                        var oModel = that.getView().getModel();
                        var oListBinding = oModel.bindList("/killUfBloqueada", undefined, undefined, undefined, { $select: "*" });

                        oListBinding.requestContexts().then(function (aContexts) {
                            oGlobalBusyDialog.close();
                            var oTable = that.getView().byId("regioTable"),
                                oBinding = oTable.getBinding("items"),
                                aFilters = [];
                            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                            oBinding.filter(aFilters);
                        });
                    }
                }
            });
        },

        handleFilterButtonPressed: function () {
            if (!this.DialogFilter) {
                this.DialogFilter = this.DialogFilter = sap.ui.xmlfragment(
                    "DialogFilterUfBloqueada",
                    "com.sap.build.standard.adminEngine.view.ViewSettingsDialog_baixa_bloq",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogFilter);
                this.DialogFilter.setModel(this.getView().getModel());

                this.DialogFilter.getModel().setSizeLimit(1500);

                this.getView().addDependent(this.DialogFilter);

            }
            // abre o value help dialog filtrando pelo input value
            this.DialogFilter.open();
        },

        handleFilterDialogConfirm: function (oEvent) {
            var oTable = this.byId("regioTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            if (this.customUfFilter) {
                this.customUfFilter.forEach((uf) => {
                    // @ts-ignore
                    var oFilter = new sap.ui.model.Filter("uf", sap.ui.model.FilterOperator.EQ, uf);
                    aFilters.push(oFilter);
                });
            }

            if (this.customCodIbgeFilter) {
                this.customCodIbgeFilter.forEach((codibge) => {
                    // @ts-ignore
                    var oFilter = new sap.ui.model.Filter("codIBGE", sap.ui.model.FilterOperator.EQ, codibge);
                    aFilters.push(oFilter);
                });
            }

            if (this.customBloqueadaFilter) {
                this.customBloqueadaFilter.forEach((bloqueada) => {
                    // @ts-ignore
                    var oFilter = new sap.ui.model.Filter("bloqueada", sap.ui.model.FilterOperator.EQ, bloqueada);
                    aFilters.push(oFilter);
                });
            }

            // mParams.filterItems.forEach(function (oItem) {
            //     var oFilter = new sap.ui.model.Filter(oItem.getKey(), sap.ui.model.FilterOperator.EQ, oItem.getText());
            //     aFilters.push(oFilter);

            //     //	oFilter = new Filter(sPath, sOperator, sValue1, sValue2);

            // });

            // apply filter settings
            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBinding.filter(aFilters);

            // update filter bar
            this.byId("vsdFilterBarr").setVisible(aFilters.length > 0);
            this.byId("vsdFilterLabell").setText(mParams.filterString);
        },
        handleSortButtonPressed: function () {
            if (!this.DialogSort) {
                this.DialogSort = this.DialogSort = sap.ui.xmlfragment(
                    "DialogSort",
                    "com.sap.build.standard.adminEngine.view.ViewSettingsDialog8_copy",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogSort);
            }
            // abre o value help dialog filtrando pelo input value
            this.DialogSort.open();
        },

        onSelectionChangeUf: function (oEvent) {
            var bSelected = oEvent.getParameter('selected');

            if (!this.customUfFilter) {
                this.customUfFilter = [];
            }

            var oList = oEvent.getSource();

            if (bSelected) {
                this.customUfFilter = [];
                oList.getSelectedContexts().forEach((uf) => {
                    this.customUfFilter.push(uf.getProperty("uf"))
                })
            } else {
                let sValueDel = oEvent.getParameter('listItem').getTitle();
                this.customUfFilter = this.customUfFilter.filter(element => element !== sValueDel);
            }

            if (this.customUfFilter.length > 0) {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescrUF")
                // @ts-ignore
                oCustomFilter.setFilterCount(this.customUfFilter.length);
                // @ts-ignore
                oCustomFilter.setSelected(true);
            } else {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescrUF")
                console.log(this.customUfFilter.length)
                oCustomFilter.setFilterCount(this.customUfFilter.length)
            }

        },
        onSelectionChangeRegiao: function (oEvent) {
            var bSelected = oEvent.getParameter('selected');

            if (!this.customFilterRegiaoBloq) {
                this.customFilterRegiaoBloq = [];
            }

            var oList = oEvent.getSource();
            var count = 0
            var valueChecked;
            if (bSelected) {
                this.customFilterRegiaoBloq = [];
                oList.getSelectedContexts().forEach((uf) => {
                    this.customFilterRegiaoBloq.push(oEvent.getSource().getSelectedContexts()[count])    
                    count = count + 1;
                });

            }
        },

        setValuesCheckBox: function (oEvent) {
            return oEvent.getSource().getSelectedContexts();
        },


        onSelectionChangeCodIbge: function (oEvent) {
            var bSelected = oEvent.getParameter('selected');

            if (!this.customCodIbgeFilter) {
                this.customCodIbgeFilter = [];
            }

            var oList = oEvent.getSource();

            if (bSelected) {
                this.customCodIbgeFilter = [];
                oList.getSelectedContexts().forEach((codibge) => {
                    this.customCodIbgeFilter.push(codibge.getProperty("codIBGE"))
                })
            } else {
                let sValueDel = oEvent.getParameter('listItem').getTitle();
                this.customCodIbgeFilter = this.customCodIbgeFilter.filter(element => element !== sValueDel);
            }

            if (this.customCodIbgeFilter.length > 0) {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescrUF")
                // @ts-ignore
                oCustomFilter.setFilterCount(this.customCodIbgeFilter.length);
                // @ts-ignore
                oCustomFilter.setSelected(true);
            } else {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescrUF")
                console.log(this.customCodIbgeFilter.length)
                oCustomFilter.setFilterCount(this.customCodIbgeFilter.length)
            }

        },
        onSelectionChangeUfBloq: function (oEvent) {
            var bSelected = oEvent.getParameter('selected');

            if (!this.customBloqueadaFilter) {
                this.customBloqueadaFilter = [];
            }

            var oList = oEvent.getSource();

            if (bSelected) {
                this.customBloqueadaFilter = [];
                oList.getSelectedContexts().forEach((uf) => {
                    this.customBloqueadaFilter.push(uf.getProperty("bloqueada"))
                })
            } else {
                let sValueDel = oEvent.getParameter('listItem').getTitle();
                this.customBloqueadaFilter = this.customBloqueadaFilter.filter(element => element !== sValueDel);
            }

            if (this.customBloqueadaFilter.length > 0) {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescUFBloq")
                // @ts-ignore
                oCustomFilter.setFilterCount(this.customBloqueadaFilter.length);
                // @ts-ignore
                oCustomFilter.setSelected(true);
            } else {
                var oCustomFilter = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescUFBloq")
                console.log(this.customBloqueadaFilter.length)
                oCustomFilter.setFilterCount(this.customBloqueadaFilter.length)
            }

        },
        onSearchDescrUF: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 1) {
                var filter = new sap.ui.model.Filter("uf", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);

                // update list binding
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "DescrUFCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            } else if (sQuery.length == 0) {
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "DescrUFCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            }
        },
        onSearchDescrIBGE: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 1) {
                var filter = new sap.ui.model.Filter("codIBGE", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);

                // update list binding
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "FornecBloqCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            } else if (sQuery.length == 0) {
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "FornecBloqCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            }
        },

        onSearchDescrUFBloq: function (oEvent) {
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 1) {
                var filter = new sap.ui.model.Filter("bloqueada", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);

                // update list binding
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "DescrUFBloqCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            } else if (sQuery.length == 0) {
                // @ts-ignore
                var oBinding = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "DescrUFBloqCustomList").getBinding("items")
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
            }
        },

        onCheckBoxSelected: function (oEvent) {
            // call the newly created function
            this._handleSelectionChange();
        },

        _handleSelectionChange: function () {
            // your code to change the row color
        },
        bloquearBaixa: function (oEvent) {
            var that = this;
            var fnSuccess = function () {
                sap.m.MessageBox.show(
                    "Dados atualizados com sucesso",
                    sap.m.MessageBox.Icon.SUCCESS,
                    "Dados gravados!"
                );
                var oTable = that.getView().byId("RegiaoUfBloq"),
                    oBinding = oTable.getBinding("items"),
                    aFilters = [];
                oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBinding.filter(aFilters);
                that.getView().getController().setHeaderContext();
            }.bind(this);

            var fnError = function (oError) {

                sap.m.MessageBox.show(
                    "Tente novamente.",
                    sap.m.MessageBox.Icon.ERROR,
                    "Erro ao atualizar os dados"
                );
            }.bind(this);

            //this._setBusy(true); // Lock UI until submitBatch is resolved.
            this.getView().getModel().submitBatch("UFGroup").then(fnSuccess, fnError);
            //this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
        },
        setHeaderContextT: function () {
            var oView = this.getView();
            oView.byId("titleCount").setBindingContext(
                oView.byId("RegiaoUfBloq").getBinding("items").getHeaderContext());
        },

        checkDone: function (oEvent) {
            var bSelected = oEvent.getParameter('selected');
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("regioTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            // apply the selected sort and group settings
            oBinding.sort(aSorters);
        },

        onResetFilters: function (oEvent) {

            // @ts-ignore
            sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "DescrUFCustomList").removeSelections();
            sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "DescrCodIbgeCustomList").removeSelections();
            sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "DescrUFBloqCustomList").removeSelections();

            this.customUfFilter = []
            this.customCodIbgeFilter = []
            this.customBloqueadaFilter = []

            var oCustomFilter1 = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescrUF");
            var oCustomFilter1 = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customCodIBGE");
            var oCustomFilter1 = sap.ui.core.Fragment.byId("DialogFilterUfBloqueada", "customDescUFBloq");

            // @ts-ignore
            oCustomFilter1.setFilterCount(0);
            // @ts-ignore
            oCustomFilter1.setSelected(false);
            // @ts-ignore
            oCustomFilter2.setFilterCount(0);
            // @ts-ignore
            oCustomFilter2.setSelected(false);
            // @ts-ignore
            oCustomFilter3.setFilterCount(0);
            // @ts-ignore
            oCustomFilter3.setSelected(false);
        }
    });
}, /* bExport= */ true);
