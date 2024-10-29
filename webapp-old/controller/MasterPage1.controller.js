sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "./utilities",
    "sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, Utilities, History, Filter, FilterOperator, JSONModel) {
    "use strict";

    return BaseController.extend("com.sap.build.standard.adminEngine.controller.MasterPage1", {
        handleRouteMatched: function (oEvent) {
            var sAppId = "App5f74baded5dbc32ead99b868";

            var oParams = {};
            var oView = this.getView();
            var bSelectFirstListItem = true;
            if (oEvent.mParameters.data.context || oEvent.mParameters.data.masterContext) {
                this.sContext = oEvent.mParameters.data.context;

                this.sMasterContext = oEvent.mParameters.data.masterContext;

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

                    this.sMasterContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

                }
            }

            var oPath;

            if (this.sMasterContext && oEvent.getParameters().config.bypassed.target[0] !== this.sMasterContext) {
                oPath = {
                    path: "/" + this.sMasterContext,
                    parameters: oParams
                };
                this.getView().bindObject(oPath);
            } else if (this.sContext) {
                var sCurrentContextPath = "/" + this.sContext;

                bSelectFirstListItem = false;
            }

            if (bSelectFirstListItem) {
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        var oContent = this.getView().getContent();
                        if (oContent) {
                            if (!sap.ui.Device.system.phone) {
                                var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
                                if (oList) {
                                    var sContentName = oList.getMetadata().getName();
                                    if (sContentName.indexOf("List") > -1) {
                                        oList.attachEventOnce("updateFinished", function () {
                                            var oFirstListItem = this.getItems()[0];
                                            if (oFirstListItem) {
                                                oList.setSelectedItem(oFirstListItem);
                                                oList.fireItemPress({
                                                    listItem: oFirstListItem
                                                });
                                            }
                                        }.bind(oList));
                                    }
                                }
                            }
                        }
                    }.bind(this)
                });
            }

        },
        _attachSelectListItemWithContextPath: function (sContextPath) {
            var oView = this.getView();
            var oContent = this.getView().getContent();
            if (oContent) {
                if (!sap.ui.Device.system.phone) {
                    var oList = oContent[0].getContent() ? oContent[0].getContent()[0] : undefined;
                    if (oList && sContextPath) {
                        var sContentName = oList.getMetadata().getName();
                        var oItemToSelect, oItem, oContext, aItems, i;
                        if (sContentName.indexOf("List") > -1) {
                            if (oList.getItems().length) {
                                oItemToSelect = null;
                                aItems = oList.getItems();
                                for (i = 0; i < aItems.length; i++) {
                                    oItem = aItems[i];
                                    oContext = oItem.getBindingContext();
                                    if (oContext && oContext.getPath() === sContextPath) {
                                        oItemToSelect = oItem;
                                    }
                                }
                                if (oItemToSelect) {
                                    oList.setSelectedItem(oItemToSelect);
                                }
                            } else {
                                oView.addEventDelegate({
                                    onBeforeShow: function () {
                                        oList.attachEventOnce("updateFinished", function () {
                                            oItemToSelect = null;
                                            aItems = oList.getItems();
                                            for (i = 0; i < aItems.length; i++) {
                                                oItem = aItems[i];
                                                oContext = oItem.getBindingContext();
                                                if (oContext && oContext.getPath() === sContextPath) {
                                                    oItemToSelect = oItem;
                                                }
                                            }
                                            if (oItemToSelect) {
                                                oList.setSelectedItem(oItemToSelect);
                                            }
                                        });
                                    }
                                });
                            }
                        }

                    }
                }
            }

        },
        _onObjectListItemPress: function (oEvent) {

            var oBindingContext = oEvent.getSource().getBindingContext();

            return new Promise(function (fnResolve) {
                if(oEvent.getSource().getTitle() == "BOM"){
                    this.doNavigate("BomPorWo", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Regra de cálculo"){
                    this.doNavigate("RegraDeCalculo", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Parâmetros"){
                    this.doNavigate("DetailPage1", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Tipos de OS"){
                    this.doNavigate("DetailPage2", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Técnicos por Fornecedor"){
                    this.doNavigate("DetailPage3", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Tipos de WO"){
                    this.doNavigate("DetailPage4", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Materiais exceção"){
                    this.doNavigate("DetailPage5", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Alçadas de aprovação"){
                    this.doNavigate("DetailPage6", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Acessórios por Terminal"){
                    this.doNavigate("DetailPage7", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Regiões"){
                    this.doNavigate("DetailPage8", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Agrupador de Materiais"){
                    this.doNavigate("DetailPage9", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Cadastro de CNPJ x Centro"){
                    this.doNavigate("DetailPage10", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Depositos WMS"){
                    this.doNavigate("DetailPage11", oBindingContext, fnResolve, "");
                }else if(oEvent.getSource().getTitle() == "Tipos de movimento x tipo de movimentação "){
                    this.doNavigate("DetailPage12", oBindingContext, fnResolve, "");
                }
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
            var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
            var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

            var sEntityNameSet;
            if (sPath !== null && sPath !== "") {
                if (sPath.substring(0, 1) === "/") {
                    sPath = sPath.substring(1);
                }
                sEntityNameSet = sPath.split("(")[0];
            }
            var sNavigationPropertyName;
            var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

            if (sEntityNameSet !== null) {
                sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
            }
            if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
                if (sNavigationPropertyName === "") {
                    this.oRouter.navTo(sRouteName, {
                        context: sPath,
                        masterContext: sMasterContext
                    }, false);
                } else {
                    oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
                        if (bindingContext) {
                            sPath = bindingContext.getPath();
                            if (sPath.substring(0, 1) === "/") {
                                sPath = sPath.substring(1);
                            }
                        } else {
                            sPath = "undefined";
                        }

                        // If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
                        if (sPath === "undefined") {
                            this.oRouter.navTo(sRouteName);
                        } else {
                            this.oRouter.navTo(sRouteName, {
                                context: sPath,
                                masterContext: sMasterContext
                            }, false);
                        }
                    }.bind(this));
                }
            } else {
                this.oRouter.navTo(sRouteName);
            }

            if (typeof fnPromiseResolve === "function") {
                fnPromiseResolve();
            }

        },
        _onObjectListItemPress1: function (oEvent) {

            var oBindingContext = oEvent.getSource().getBindingContext();

            return new Promise(function (fnResolve) {

                this.doNavigate("RegraDeCalculo", oBindingContext, fnResolve, "");
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        _onObjectListItemPress2: function (oEvent) {

            var oBindingContext = oEvent.getSource().getBindingContext();

            return new Promise(function (fnResolve) {

                this.doNavigate("DetailPage1", oBindingContext, fnResolve, "");
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        _onObjectListItemPress3: function (oEvent) {

            var oBindingContext = oEvent.getSource().getBindingContext();

            return new Promise(function (fnResolve) {

                this.doNavigate("DetailPage2", oBindingContext, fnResolve, "");
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        _onObjectListItemPress4: function (oEvent) {

            var oBindingContext = oEvent.getSource().getBindingContext();

            return new Promise(function (fnResolve) {

                this.doNavigate("DetailPage3", oBindingContext, fnResolve, "");
            }.bind(this)).catch(function (err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });

        },
        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                List: [
                    {
                        mainText: "BOM",
                        subText: "Configuração de BOM"
                    }, {
                        mainText: "Regra de cálculo",
                        subText: "Regra de cálculo de variações de valor e quantidade"
                    }, {
                        mainText: "Parâmetros",
                        subText: "Parâmetros gerais da aplicação"
                    }, {
                        mainText: "Tipos de OS",
                        subText: "Tipos de OS"
                    }, {
                        mainText: "Técnicos por Fornecedor",
                        subText: "Manutenção de técnicos por Fornecedor"
                    }, {
                        mainText: "Tipos de WO",
                        subText: "Tipos de WO ativos para baixa automática"
                    }, {
                        mainText: "Materiais exceção",
                        subText: "Não controlados pela BOM"
                    }, {
                        mainText: "Alçadas de aprovação",
                        subText: "Configurações percentual de aprovações"
                    }, {
                        mainText: "Acessórios por Terminal",
                        subText: "Kits de terminais"
                    }, {
                        mainText: "Regiões",
                        subText: "Cod IBGE por região"
                    }, {
                        mainText: "Agrupador de Materiais",
                        subText: "Materiais substitutos"
                    }, {
                        mainText: "Cadastro de CNPJ x Centro",
                        subText: "Validação CNPJ/centro operador logístico"
                    }, {
                        mainText: "Depositos WMS",
                        subText: "Cadastro de depósitos a serem integrados no WMS"
                    }, {
                        mainText: "Tipos de movimento x tipo de movimentação ",
                        subText: ""
                    }
                ]
            });
            this.getView().setModel(oModel);
            this.oRouter.getTarget("MasterPage1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

        },
        onSearch: function (oEvent) {
            // add filter for search
            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("mainText", FilterOperator.Contains, sQuery);
                aFilters.push(filter);
            }

            // update list binding
            var oList = this.byId("idList");
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");
        }
    });
}, /* bExport= */ true);
