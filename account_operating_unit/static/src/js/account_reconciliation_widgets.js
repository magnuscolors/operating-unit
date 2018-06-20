odoo.define('account_operating_unit.reconciliation', function (require) {
"use strict";

    // require original module JS
    var core = require('web.core');
    var _t = core._t;
    var FieldMany2One = core.form_widget_registry.get('many2one');

    var reconciliation = require('account.reconciliation');
    reconciliation.abstractReconciliation.include({

        init: function(parent, context) {
            this._super(parent);
            this.create_form_fields['operating_unit_id'] = {
                id: "operating_unit_id",
                index: 0, // position in the form
                corresponding_property: "operating_unit_id", // a account.move.line field name
                label: _t("Operating Unit"),
                required: true,
                constructor: FieldMany2One,
                field_properties: {
                    relation: "operating.unit",
                    string: _t("Operating Unit"),
                    type: "many2one",
                    domain: [],
                },
            }
        }
    })

    reconciliation.abstractReconciliationLine.include({
        prepareCreatedMoveLinesForPersisting: function(lines) {
            lines = _.filter(lines, function(line) { return !line.is_tax_line });
            return _.collect(lines, function(line) {
                var dict = {
                    account_id: line.account_id,
                    name: line.label
                };
                // Use amount_before_tax since the amount of the newly created line is adjusted to
                // reflect tax included in price in account_move_line.create()
                var amount = line.tax_id ? line.amount_before_tax: line.amount;
                dict['credit'] = (amount > 0 ? amount : 0);
                dict['debit'] = (amount < 0 ? -1 * amount : 0);
                dict['operating_unit_id'] = line.operating_unit_id;
                if (line.tax_id) dict['tax_ids'] = [[4, line.tax_id, null]];
                if (line.analytic_account_id) dict['analytic_account_id'] = line.analytic_account_id;
                return dict;
            });

        }
    })

});

