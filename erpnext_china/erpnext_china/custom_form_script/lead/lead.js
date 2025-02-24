// Copyright (c) 2019, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt
// Script for ToDo Form
frappe.ui.form.on('Lead', {
    // on refresh event
    refresh(frm) {
        // if reference_type and reference_name are set,
        // add a custom button to go to the reference form
        if (!frm.is_new()) {

            const contactFields = ['phone', 'mobile_no', 'custom_wechat']
            
            // 如果不是网络推广管理和管理员，其它人都不能编辑联系方式
            const readOnly = !frappe.user.has_role('网络推广管理') && !frappe.user.has_role('System Manager')
            if(readOnly) {
                contactFields.forEach(field => {
                    frm.fields_dict[field].df.read_only = !!frm.doc[field];
                });
            }

            // 如果是网络推广或者网推管理或者管理员或者是私海，则显示联系方式
            const show = frappe.user.has_role('网络推广') || 
                        frappe.user.has_role('网络推广管理') || 
                        frappe.user.has_role('System Manager') || 
                        frm.doc.custom_sea == "私海";
    
            contactFields.forEach(field => {
                frm.fields_dict[field].df.hidden = !show; // 隐藏联系方式
                frm.refresh_field(field);
            });

            if (!show) {
                // 提示认领
                frm.set_intro();
                frm.set_intro(__("请在右上角【行动】或【...】中点击【认领线索】查看联系方式。"));
            }

            if(frappe.session.user == frm.doc.lead_owner) {
                frm.add_custom_button(__("放弃线索"), ()=>{
                    // frappe.db.set_value('Lead', frm.doc.name, {lead_owner: null});
                    frappe.call("erpnext_china.erpnext_china.custom_form_script.lead.lead.give_up_lead", {lead: frm.doc.name}).then((r)=>{
                        console.log(r);
                        if(r && r.message==200) {
                            window.location.reload();
                        }
                        
                    })
                }, __("Action"));
            } else {
                if(frm.doc.lead_owner == "" || frm.doc.custom_sea == "公海") {
                    frm.add_custom_button(__("认领线索"), ()=>{
                        // frappe.db.set_value('Lead', frm.doc.name, {lead_owner: frappe.session.user});
                        frappe.call("erpnext_china.erpnext_china.custom_form_script.lead.lead.get_lead", {lead: frm.doc.name}).then((r)=>{
                            if(r && r.message==200) {
                                window.location.reload();
                            }
                        })
                        
                    }, __("Action"));
                }
            }
        }
    }
})