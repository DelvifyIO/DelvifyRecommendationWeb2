// Repeatedly prompt for user password until success:
(function promptPass() {
    let password = window.localStorage.getItem('password') || prompt("Enter your Password");
    jQuery.ajax({
        type: 'GET',
        url: process.env.API_HOST + "/password",
        data: { password },
        success: function (result) {
            if (result !== 'OK') {
                alert("Incorrect Password");
                window.localStorage.removeItem('password');
                return promptPass();
            } else {
                window.localStorage.setItem('password', password);
            };
        },
        error: function (result) {
            alert("Incorrect Password");
            return promptPass();
        },
        async: false
    });
}());