sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/m/MessageBox",
    "./utilities",
    "sap/ui/core/routing/History"
], function (ManagedObject, MessageBox, Utilities, History) {

    return ManagedObject.extend("com.sap.build.standard.adminEngine.controller.Dialog5", {
        constructor: function (oView) {
            this._oView = oView;
            this._oControl = sap.ui.xmlfragment(oView.getId(), "com.sap.build.standard.adminEngine.view.Dialog5", this);
            this._bInit = false;
        },

        exit: function () {
            delete this._oView;
        },

        getView: function () {
            return this._oView;
        },

        getControl: function () {
            return this._oControl;
        },

        getOwnerComponent: function () {
            return this._oView.getController().getOwnerComponent();
        },

        open: function () {
            var oView = this._oView;
            var oControl = this._oControl;

            if (!this._bInit) {

                // Initialize our fragment
                this.onInit();

                this._bInit = true;

                // connect fragment to the root view of this component (models, lifecycle)
                oView.addDependent(oControl);
            }

            var args = Array.prototype.slice.call(arguments);
            if (oControl.open) {
                oControl.open.apply(oControl, args);
            } else if (oControl.openBy) {
                oControl.openBy.apply(oControl, args);
            }
        },

        close: function () {
            this._oControl.close();
        },

        setRouter: function (oRouter) {
            this.oRouter = oRouter;

        },
        getBindingParameters: function () {
            return {};

        },
        _onButtonPress: function () {

            this.close();

        },
        _onButtonPress1: function () {

            this.close();

        },
        onInit: function () {

            this._oDialog = this.getControl();

        },
        onExit: function () {
            this._oDialog.destroy();

            // to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
            var aControls = [{
                "controlId": "sap_m_Dialog_4-content-build_simple_form_Form-1605901539681-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-1605901750490-fields-sap_m_ComboBox-1",
                "groups": ["items"]
            }];
            for (var i = 0; i < aControls.length; i++) {
                var oControl = this.getView().byId(aControls[i].controlId);
                if (oControl) {
                    for (var j = 0; j < aControls[i].groups.length; j++) {
                        var sAggregationName = aControls[i].groups[j];
                        var oBindingInfo = oControl.getBindingInfo(sAggregationName);
                        if (oBindingInfo) {
                            var oTemplate = oBindingInfo.template;
                            oTemplate.destroy();
                        }
                    }
                }
            }

        },
        handleValueHelp: function (oEvent) {
            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/",
            });
            this.inputId = oEvent.getSource().getId();
            // cria o value help dialog
            if (!this.DialogTipoOs) {
                this.DialogTipoOs = this.DialogTipoOs = sap.ui.xmlfragment(
                    "DialogTipoOs",
                    "com.sap.build.standard.adminEngine.view.DialogTipoOs",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogTipoOs);
                sap.ui.core.Fragment.byId("DialogTipoOs", "List").setModel(oModel);
            } else {
                var aFilters = []
                var oBind = sap.ui.core.Fragment.byId("DialogTipoOs", "List").getBinding("items");
                oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBind.filter(aFilters, sap.ui.model.FilterType.Application);
            }
            //var oJsonModel = new sap.ui.model.json.JSONModel();
            // abre o value help dialog filtrando pelo input value
            this.DialogTipoOs.open();
            //	oGlobalBusyDialog.open();
        },
        handleValueHelpMat: function (oEvent) {
            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/",
            });
            this.inputId = oEvent.getSource().getId();
            // cria o value help dialog
            if (!this.DialogMateriais) {
                this.DialogMateriais = this.DialogMateriais = sap.ui.xmlfragment(
                    "DialogMateriais",
                    "com.sap.build.standard.adminEngine.view.DialogMateriais",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogMateriais);
                sap.ui.core.Fragment.byId("DialogMateriais", "List").setModel(oModel);
            } else {
                var aFilters = []
                var oBind = sap.ui.core.Fragment.byId("DialogMateriais", "List").getBinding("items");
                oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBind.filter(aFilters, sap.ui.model.FilterType.Application);
            }
            //var oJsonModel = new sap.ui.model.json.JSONModel();
            // abre o value help dialog filtrando pelo input value
            this.DialogMateriais.open();
            //	oGlobalBusyDialog.open();
        },
        _handleValueHelpCloseOs: function (evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            var that = this;
            if (oSelectedItem) {
                //var arrayId = that.inputId.split("TpOS");
                // var idTpOs = arrayId[0] + "TpOS";
                that.getView().byId(that.inputId).setValue(oSelectedItem.getDescription());
                that.getView().byId("TpOs").setValue(oSelectedItem.getTitle());
            }
            //evt.getSource().getBinding("items").filter([]);
        },
        _handleValueHelpCloseMateriais: function (evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            var that = this;
            if (oSelectedItem) {
                //var arrayId = that.inputId.split("TpOS");
                // var idTpOs = arrayId[0] + "TpOS";
                that.getView().byId(that.inputId).setValue(oSelectedItem.getDescription());
                that.getView().byId("CodMatSAP").setValue(oSelectedItem.getTitle());
            }
            //evt.getSource().getBinding("items").filter([]);
        },
        _handleValueHelpSearch: function (evt) {
            var sValue = evt.getParameter("value").toUpperCase();
            var filter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("descricaoOs", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("tipoOs", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            })
            //var FilterdescricaoOs = new sap.ui.model.Filter("descricaoOs", sap.ui.model.FilterOperator.Contains, sValue);
            var oBind = sap.ui.core.Fragment.byId("DialogTipoOs", "List").getBinding("items");
            oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBind.filter(filter, sap.ui.model.FilterType.Application);
            //evt.getSource().getBinding("items").filter([FilterdescricaoOs]);
        },
        _handleValueHelpSearchMateriais: function (evt) {
            var aFilters = []
            var sValue = evt.getParameter("value").toUpperCase();
            var filter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("descMaterial", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("material", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            })
            // var FilterdescMaterial = new sap.ui.model.Filter("descMaterial", sap.ui.model.FilterOperator.Contains, sValue);
            // aFilters.push(FilterdescMaterial);
            // var FilterMaterial = new sap.ui.model.Filter("material", sap.ui.model.FilterOperator.Contains, sValue);
            // aFilters.push(FilterMaterial);
            var oBind = sap.ui.core.Fragment.byId("DialogMateriais", "List").getBinding("items");
            oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBind.filter(filter, sap.ui.model.FilterType.Application);
            //evt.getSource().getBinding("items").filter([FilterdescricaoOs]);
        },
        _setUIChanges: function (bHasUIChanges) {
            if (this._bTechnicalErrors) {
                // If there is currently a technical error, then force 'true'.
                bHasUIChanges = true;
            } else if (bHasUIChanges === undefined) {
                bHasUIChanges = this.getView().getModel().hasPendingChanges();
            }
            var oModel = this.getView().getModel();
            oModel.setProperty("/hasUIChanges", bHasUIChanges);
        },
        onCreate: function () {
            if (this.getView().byId("agrupador").getValue() != "" && this.getView().byId("MatSAP").getValue() != "") {
                sap.m.MessageBox.show(
                    "Não é possível inserir Agrupador de materiais E Código de material",
                    sap.m.MessageBox.Icon.ERROR,
                    "Erro ao atualizar os dados"
                );
            } else {
            var pct = this.getView().byId("quantPct").getValue();
            if(pct == ""){
                pct = "0";
            }
            var tol = this.getView().byId("quantTol").getValue();
            if(tol == ""){
                tol = "0";
            }
            var oList = this.getView().byId("bomTable"),
                oBinding = oList.getBinding("items"),
                oContext = oBinding.create({
                    "regiao": this.getView().byId("regiao").getValue(),
                    "tipoInstalacao": this.getView().byId("TpInst").getSelectedKey(),
                    "idTipoOS": this.getView().byId("TpOs").getValue(),
                    "tecnologia": this.getView().byId("tecnologia").getValue(),
                    //"tipoOs/descricaoOs" : this.getView().byId("DescOs").getValue(),
                    "codMaterialSAP": this.getView().byId("CodMatSAP").getValue(),
                    //"materiais/descMaterial" :  this.getView().byId("MatSAP").getValue(),
                    "agrupador": this.getView().byId("agrupador").getValue(),
                    "qtdMin": this.getView().byId("quantMin").getValue(),
                    "qtdMax": this.getView().byId("quantMax").getValue(),
                    "unidadeConsumo": this.getView().byId("unidade").getValue(),
                    "pctBom": pct,
                    "qtdTol": tol,
                    "aprovacaoClaro": this.getView().byId("aprovacaoClaro").getSelected()
                });
            var that = this;

            //this._setUIChanges();
            //this.getView().getModel("appView").setProperty("/usernameEmpty", true);

            oList.getItems().some(function (oItem) {
                if (oItem.getBindingContext() === oContext) {
                    oItem.focus();
                    oItem.setSelected(true);
                    that.getView().getController().onSave();
                    return true;
                }
            });
            this.close();
        }
        },
        handleValueHelpRegiao: function (oEvent) {
            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/",
            });
            this.inputId = oEvent.getSource().getId();
            // cria o value help dialog
            if (!this.DialogRegiao) {
                this.DialogRegiao = this.DialogRegiao = sap.ui.xmlfragment(
                    "DialogRegiao",
                    "com.sap.build.standard.adminEngine.view.DialogRegiao",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogRegiao);
                sap.ui.core.Fragment.byId("DialogRegiao", "List").setModel(oModel);
            } else {
                var aFilters = []
                var oBind = sap.ui.core.Fragment.byId("DialogRegiao", "List").getBinding("items");
                oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBind.filter(aFilters, sap.ui.model.FilterType.Application);
            }
            //var oJsonModel = new sap.ui.model.json.JSONModel();
            // abre o value help dialog filtrando pelo input value
            this.DialogRegiao.open();
            //	oGlobalBusyDialog.open();
        },
        handleValueHelpAgrupador: function (oEvent) {
            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/motor-de-regras/",
            });
            this.inputId = oEvent.getSource().getId();
            // cria o value help dialog
            if (!this.DialogAgrupador) {
                this.DialogAgrupador = this.DialDialogAgrupadorogRegiao = sap.ui.xmlfragment(
                    "DialogAgrupador",
                    "com.sap.build.standard.adminEngine.view.DialogAgrupador",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogAgrupador);
                sap.ui.core.Fragment.byId("DialogAgrupador", "List").setModel(oModel);
            } else {
                var aFilters = []
                var oBind = sap.ui.core.Fragment.byId("DialogAgrupador", "List").getBinding("items");
                oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBind.filter(aFilters, sap.ui.model.FilterType.Application);
            }
            //var oJsonModel = new sap.ui.model.json.JSONModel();
            // abre o value help dialog filtrando pelo input value
            this.DialogAgrupador.open();
            //	oGlobalBusyDialog.open();
        },
        _handleValueHelpCloseRegiao: function (evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            var that = this;
            if (oSelectedItem) {
                that.getView().byId(that.inputId).setValue(oSelectedItem.getTitle());
            }
        },
        _handleValueHelpSearchRegiao: function (evt) {
            var sValue = evt.getParameter("value").toUpperCase();
            var filter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("regiao", sap.ui.model.FilterOperator.Contains, sValue),
                ],
                and: false
            })
            //var FilterdescricaoOs = new sap.ui.model.Filter("descricaoOs", sap.ui.model.FilterOperator.Contains, sValue);
            var oBind = sap.ui.core.Fragment.byId("DialogRegiao", "List").getBinding("items");
            oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBind.filter(filter, sap.ui.model.FilterType.Application);
            //evt.getSource().getBinding("items").filter([FilterdescricaoOs]);
        },
        _handleValueHelpCloseAgrupador: function (evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            var that = this;
            if (oSelectedItem) {
                that.getView().byId(that.inputId).setValue(oSelectedItem.getTitle());
            }
        },
        _handleValueHelpSearchAgrupador: function (evt) {
            var sValue = evt.getParameter("value").toUpperCase();
            var filter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("agrupador", sap.ui.model.FilterOperator.Contains, sValue),
                ],
                and: false
            })
            //var FilterdescricaoOs = new sap.ui.model.Filter("descricaoOs", sap.ui.model.FilterOperator.Contains, sValue);
            var oBind = sap.ui.core.Fragment.byId("DialogAgrupador", "List").getBinding("items");
            oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBind.filter(filter, sap.ui.model.FilterType.Application);
            //evt.getSource().getBinding("items").filter([FilterdescricaoOs]);
        }


    });
}, /* bExport= */ true);