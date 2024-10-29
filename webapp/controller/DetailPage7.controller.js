sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./Dialog10",
    "./utilities",
    "sap/ui/core/routing/History",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "../libs/jszip",
    "../libs/xlsx"
], function (BaseController, MessageBox, Dialog10, Utilities, History, Export, ExportTypeCSV, exportLibrary, Spreadsheet, jszipjs, xlsxjs) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    var excelImported = "";
    return BaseController.extend("com.sap.build.standard.adminEngine.controller.DetailPage7", {
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
        _onOverflowToolbarButtonPress: function (oEvent) {

            var sDialogName = "Dialog10";
            this.mDialog10 = this.mDialog10 || {};
            var oDialog = this.mDialog10[sDialogName];
            if (!oDialog) {
                oDialog = new Dialog10(this.getView());
                this.mDialog10[sDialogName] = oDialog;

                // For navigation.
                oDialog.setRouter(this.oRouter);
            } else {
                this.getView().byId("terminal").setValue("");
                this.getView().byId("acessorio").setValue("");
            }

            var context = oEvent.getSource().getBindingContext();
            oDialog._oControl.setBindingContext(context);

            oDialog.open();

        },
        onInit: function () {
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
            var oListBinding = this.getView().getModel().bindList("/TipoWoBaixaAutomatica", undefined, undefined, undefined, { $select: "*" });
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
                property: 'terminal',
                type: EdmType.String
            });

            aCols.push({
                // label: 'Tipo de Inst.',
                property: 'acessorio',
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
                this._oTable = this.byId('acessorioTable');
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
                fileName: 'Acessorio Terminal.xlsx',
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
            var oTable = that.getView().byId("acessorioTable");
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
            var oTable = that.getView().byId("acessorioTable");
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
                        AcessoTerminal: excelData
                    });
                    var oModelData = oModelo.getProperty("/");
                    var oColumns = Object.keys(oModelData["AcessoTerminal"][0]);
                    if (oColumns[0] == "terminal" &&
                        oColumns[1] == "acessorio") {
                        var oGlobalBusyDialog = new sap.m.BusyDialog();
                        oGlobalBusyDialog.open();
                        var oModel = that.getView().getModel();
                        var oListBinding = oModel.bindList("/importAcessoTerminal", undefined, undefined, undefined, { $$updateGroupId: "tipoWoExcel" });

                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        oListBinding.attachCreateCompleted(function (oEvent) {
                            oGlobalBusyDialog.close();
                            if (oEvent.getParameter("success")) {
                                MessageBox.show(
                                    "Dados importados com sucesso", {
                                    icon: MessageBox.Icon.SUCCESS,
                                    title: "Dados gravados!",
                                    onClose: function (oAction) {
                                        var oListBinding = that.getView().getModel().bindList("/upsert_acessoTerminal()", undefined, undefined, undefined, undefined);
                                        oListBinding.requestContexts(0, Infinity).then(function (aContext) {

                                            var oTable = that.getView().byId("acessorioTable"),
                                                oBinding = oTable.getBinding("items"),
                                                aFilters = [];
                                            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                                            oBinding.filter(aFilters);
                                        })
                                    }
                                }
                                );
                            } else {
                                sap.m.MessageBox.show(
                                    sap.ui.getCore().getMessageManager().getMessageModel().getData()[0].message,
                                    sap.m.MessageBox.Icon.ERROR,
                                    "Erro ao realizar o upload!"
                                );
                                that.byId("acessorioTable").getBinding("items").resetChanges();
                                //   sap.ui.getCore().getMessageManager().removeAllMessages();
                            }
                        }.bind(this));
                        //var  oContext = "";
                        var oData = [];
                        $.each(excelData, function (index, value) {
                            oData.push({
                                "terminal": value.terminal,
                                "acessorio": value.acessorio
                            });
                        });
                        var oContext = oListBinding.create({
                            "AcessoTerminal": oData
                        }, true);

                        if (excelData.length > 0) {
                            //that.onSave();
                            that.getView().getModel().submitBatch("tipoWoExcel");
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
        onSave: function () {
            var that = this;
            var fnSuccess = function () {

                sap.m.MessageBox.show(
                    "Dados atualizados com sucesso",
                    sap.m.MessageBox.Icon.SUCCESS,
                    "Dados gravados!"
                );
                var oTable = that.getView().byId("acessorioTable"),
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
            this.getView().getModel().submitBatch("AcessoTerminalGroup").then(fnSuccess, fnError);
            //this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
        },
        onResetChanges: function () {
            this.byId("acessorioTable").getBinding("items").resetChanges();

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
                oView.byId("acessorioTable").getBinding("items").getHeaderContext());
        },
        onDeleteAcess: function () {
            var that = this;
            MessageBox.warning("Tem certeza que seja excluir toda a lista? É recomendado realizar o download dos dados antes de prosseguir", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction == "OK") {
                        var oGlobalBusyDialog = new sap.m.BusyDialog();
                        oGlobalBusyDialog.open();
                        var oModel = that.getView().getModel();
                        var oListBinding = oModel.bindList("/killAcessoTerminal", undefined, undefined, undefined, { $select: "*" });

                        oListBinding.requestContexts().then(function (aContexts) {
                            oGlobalBusyDialog.close();
                            var oTable = that.getView().byId("acessorioTable"),
                                oBinding = oTable.getBinding("items"),
                                aFilters = [];
                            oBinding.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                            oBinding.filter(aFilters);
                        });
                    }
                }
            });
        }
    });
}, /* bExport= */ true);
