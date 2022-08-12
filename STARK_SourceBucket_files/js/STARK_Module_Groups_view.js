var root = new Vue({
    el: "#vue-root",
    data: {
        listview_table: '',
        STARK_Module_Groups: {
            'Group_Name': '',
            'sk': '',
            'Description': '',
            'Icon': '',
            'Priority': '',
        },
        lists: {
        },
        list_status: {
        },
        visibility: 'hidden',
        next_token: '',
        next_disabled: true,
        prev_token: '',
        prev_disabled: true,
        page_token_map: {1: ''},
        curr_page: 1

    },
    methods: {

        show: function () {
            this.visibility = 'visible';
        },

        hide: function () {
            this.visibility = 'hidden';
        },

        add: function () {
            loading_modal.show()
            console.log("VIEW: Inserting!")

            let data = { STARK_Module_Groups: this.STARK_Module_Groups }

            STARK_Module_Groups_app.add(data).then( function(data) {
                console.log("VIEW: INSERTING DONE!");
                loading_modal.hide()
                window.location.href = "STARK_Module_Groups.html";
            }).catch(function(error) {
                console.log("Encountered an error! [" + error + "]")
                alert("Request Failed: System error or you may not have enough privileges")
                loading_modal.hide()
            });
        },

        delete: function () {
            loading_modal.show()
            console.log("VIEW: Deleting!")

            let data = { STARK_Module_Groups: this.STARK_Module_Groups }

            STARK_Module_Groups_app.delete(data).then( function(data) {
                console.log("VIEW: DELETE DONE!");
                console.log(data);
                loading_modal.hide()
                window.location.href = "STARK_Module_Groups.html";
            })
            .catch(function(error) {
                console.log("Encountered an error! [" + error + "]")
                alert("Request Failed: System error or you may not have enough privileges")
                loading_modal.hide()
            });
        },

        update: function () {
            loading_modal.show()
            console.log("VIEW: Updating!")

            let data = { STARK_Module_Groups: this.STARK_Module_Groups }

            STARK_Module_Groups_app.update(data).then( function(data) {
                console.log("VIEW: UPDATING DONE!");
                console.log(data);
                loading_modal.hide()
                window.location.href = "STARK_Module_Groups.html";
            })
            .catch(function(error) {
                console.log("Encountered an error! [" + error + "]")
                alert("Request Failed: System error or you may not have enough privileges")
                loading_modal.hide()
            });
        },

        get: function () {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            //Get whatever params are needed here (pk, sk, filters...)
            data = {}
            data['Group_Name'] = urlParams.get('Group_Name');

            if(data['Group_Name'] == null) {
                root.show();
            }
            else {
                loading_modal.show();
                console.log("VIEW: Getting!")

                STARK_Module_Groups_app.get(data).then( function(data) {
                    root.STARK_Module_Groups = data[0]; //We need 0, because API backed func always returns a list for now
                    root.STARK_Module_Groups.orig_Group_Name = root.STARK_Module_Groups.Group_Name;
                    console.log("VIEW: Retreived module data.")
                    root.show()
                    loading_modal.hide()
                })
                .catch(function(error) {
                    console.log("Encountered an error! [" + error + "]")
                    alert("Request Failed: System error or you may not have enough privileges")
                    loading_modal.hide()
                });
            }
        },

       list: function (lv_token='', btn='') {
            spinner.show()
            payload = []
            if (btn == 'next') {
                root.curr_page++;
                console.log(root.curr_page);
                payload['Next_Token'] = lv_token;

                //When Next button is clicked, we should:
                // - save Next Token to new page in page_token_map
                // - hide Next button - it will be visible again if API call returns a new Next Token
                // - if new_page is > 2, assign {new_page - 1} token to prev_token
                root.prev_disabled = false;    
                root.next_disabled = true;

                root.page_token_map[root.curr_page] = lv_token;

                if (root.curr_page > 1) {
                    root.prev_token = root.page_token_map[root.curr_page - 1];
                }
                console.log(root.page_token_map)
                console.log(root.prev_token)
            }
            else if (btn == "prev") {
                root.curr_page--;

                if (root.prev_token != "") {
                    payload['Next_Token'] = root.page_token_map[root.curr_page];
                }

                if (root.curr_page > 1) {
                    root.prev_disabled = false
                    root.prev_token = root.page_token_map[root.curr_page - 1]
                }
                else {
                    root.prev_disabled = true
                    root.prev_token = ""
                }
            }

            STARK_Module_Groups_app.list(payload).then( function(data) {
                token = data['Next_Token'];
                root.listview_table = data['Items'];
                console.log("DONE! Retrieved list.");
                spinner.hide()

                if (token != "null") {
                    root.next_disabled = false;
                    root.next_token = token;
                }
                else {
                    root.next_disabled = true;
                }

            })
            .catch(function(error) {
                console.log("Encountered an error! [" + error + "]")
                alert("Request Failed: System error or you may not have enough privileges")
                spinner.hide()
            });
        },
    }
})
