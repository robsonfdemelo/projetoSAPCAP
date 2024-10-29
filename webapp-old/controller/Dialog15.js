sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/m/MessageBox",
    "./utilities",
    "sap/ui/core/routing/History"
], function (ManagedObject, MessageBox, Utilities, History) {

    return ManagedObject.extend("com.sap.build.standard.adminEngine.controller.Dialog15", {
        constructor: function (oView) {
            this._oView = oView;
            this._oControl = sap.ui.xmlfragment(oView.getId(), "com.sap.build.standard.adminEngine.view.Dialog15", this);
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
            if (this.getView().byId("tp_mov_origem").getValue() == ""  ||
            this.getView().byId("tp_mov_destino").getValue() == ""  ||
            this.getView().byId("tp_movimento").getValue() == "" ) {
                sap.m.MessageBox.show(
                    "Preencha todos os campos antes de gravar!.",
                    sap.m.MessageBox.Icon.ERROR,
                    "Erro ao atualizar os dados"
                );
            } else {
                var oList = this.getView().byId("tipoMovTable"),
                    oBinding = oList.getBinding("items");
                var exists = false;
                if (oList.getItems()[0]) {
                    var sPath = "";
                    for (var i = 0; i < oList.getItems()[0].getBindingContext().getBinding().aContexts.length; i++) {
                        //  sPath = oList.getItems()[0].getBindingContext().getBinding().aContexts[i].sPath.split("('");
                        // sPath = sPath[1].replaceAll('%20', ' ');
                        //sPath = sPath.replace("')", "");
                        var vtp_mov_origem = oList.getItems()[i].getBindingContext().getProperty("tp_mov_origem");
                        var vtp_mov_destino = oList.getItems()[i].getBindingContext().getProperty("tp_mov_destino");

                        if (vtp_mov_origem == this.getView().byId("tp_mov_origem").getValue() &&
                        vtp_mov_destino == this.getView().byId("tp_mov_destino").getValue()) {
                            exists = true;
                            break;
                        }
                    }
                }
                if (exists == false) {
                    var that = this;
                    var oGlobalBusyDialog = new sap.m.BusyDialog();
                    oGlobalBusyDialog.open();
                    var oModel = that.getView().getModel();
                    var oListBinding = oModel.bindList("/tipoMov", undefined, undefined, undefined, { $$updateGroupId: "tipoMovDialog" });

                    sap.ui.getCore().getMessageManager().removeAllMessages();
                    oListBinding.attachCreateCompleted(function (oEvent) {
                        oGlobalBusyDialog.close();
                        if (oEvent.getParameter("success")) {
                            MessageBox.show(
                                "Dados importados com sucesso", {
                                icon: MessageBox.Icon.SUCCESS,
                                title: "Dados gravados!",
                                onClose: function (oAction) {
                                    that.close();
                                    var oTable = that.getView().byId("tipoMovTable"),
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
                                "Erro ao gravar os dados"
                            );
                            that.byId("tipoMovDialog").getBinding("items").resetChanges();
                            //   sap.ui.getCore().getMessageManager().removeAllMessages();
                        }
                    }.bind(this));
                    var oData = [];
                    oData.push({
                        "mandt": "800",
                        "tp_mov_origem": this.getView().byId("tp_mov_origem").getValue(),
                        "tp_mov_destino": this.getView().byId("tp_mov_destino").getValue(),
                        "tp_movimento": this.getView().byId("tp_movimento").getValue(),
                        "descricao": this.getView().byId("descricao").getValue(),
                        "tcode": this.getView().byId("tcode").getValue(),
                    });
                    var oContext = oListBinding.create({
                        "mandt": "800",
                        "tp_mov_origem": this.getView().byId("tp_mov_origem").getValue(),
                        "tp_mov_destino": this.getView().byId("tp_mov_destino").getValue(),
                        "tp_movimento": this.getView().byId("tp_movimento").getValue(),
                        "descricao": this.getView().byId("descricao").getValue(),
                        "tcode": this.getView().byId("tcode").getValue(),
                    }, true);

                    if (oData.length > 0) {
                        //that.onSave();
                        that.getView().getModel().submitBatch("tipoMovDialog");
                    }
                } else {
                    sap.m.MessageBox.show(
                        "Registro já cadastrado, favor verificar.",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao atualizar os dados"
                    );
                }
            }
        },
        handleValueHelp: function (oEvent) {
            var oModel = new sap.ui.model.odata.v4.ODataModel({
                groupId: "$direct",
                synchronizationMode: "None",
                serviceUrl: "/AdmMotorRegras.comsapbuildstandardadminEngine/valida-regras/",
            });
            this.inputId = oEvent.getSource().getId();
            // cria o value help dialog
            if (!this.DialogDeposito) {
                this.DialogDeposito = this.DialogDeposito = sap.ui.xmlfragment(
                    "DialogDeposito",
                    "com.sap.build.standard.adminEngine.view.DialogDeposito",
                    this
                );
                //to get access to the global model
                this.getView().addDependent(this.DialogDeposito);
                sap.ui.core.Fragment.byId("DialogDeposito", "List").setModel(oModel);
            } else {
                var aFilters = []
                var oBind = sap.ui.core.Fragment.byId("DialogDeposito", "List").getBinding("items");
                oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
                oBind.filter(aFilters, sap.ui.model.FilterType.Application);
            }
            //var oJsonModel = new sap.ui.model.json.JSONModel();
            // abre o value help dialog filtrando pelo input value
            this.DialogDeposito.open();
        },
        _handleValueHelpSearch: function (evt) {
            var aFilters = []
            var sValue = evt.getParameter("value").toUpperCase();
            var filter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("lgobe", sap.ui.model.FilterOperator.Contains, sValue),
                    new sap.ui.model.Filter("lgort", sap.ui.model.FilterOperator.Contains, sValue)
                ],
                and: false
            })
            var oBind = sap.ui.core.Fragment.byId("DialogDeposito", "List").getBinding("items");
            oBind.sOperationMode = sap.ui.model.odata.OperationMode.Server;
            oBind.filter(filter, sap.ui.model.FilterType.Application);
        },
        _handleValueHelpClose: function (evt) {
            var oSelectedItem = evt.getParameter("selectedItem");
            var that = this;
            if (oSelectedItem) {
                that.getView().byId(that.inputId).setValue(oSelectedItem.getTitle());
            }
        }

    });
}, /* bExport= */ true);