let password = "demo"; // because ANYONE CAN SEE THIS IN VIEW SOURCE!


// Repeatedly prompt for user password until success:
(function promptPass() {

    let password = prompt("Enter your Password");

    jQuery.ajax({
        type: 'GET',
        url: process.env.API_HOST + "/password",
        data: { password },
        success: function (result) {
            if (result !== 'OK') {
                alert("Incorrect Password");
                return promptPass();
            };
        },
        error: function (result) {
            alert("Incorrect Password");
            return promptPass();
        },
        async: false
    });
}());