$( document ).ready(function() {
    let enabledAI = getQuery()['ai'] === 'true' || false;
    let loading = false;
    let recordingState = 'idle'; // ['idle', 'recording', 'stopped', 'loading']

    const getMicrophonePermission = () => {
        return new Promise((resolve, reject) => {
            navigator.permissions.query({ name:'microphone' }).then(function(result) {
                console.log(result.state);
                if (result.state == 'granted') {
                    return resolve();
                } else if (result.state == 'prompt') {
                    navigator.getUserMedia({ audio: true }, () => {
                        return resolve();
                    }, () => { return reject(); });
                }
                else if (result.state == 'denied') {
                    return reject('No permission');
                }
                result.onchange = function(e) {
                    if (e.isTrusted) {
                        return resolve();
                    } else {
                        return reject('No permission');
                    }
                };
            });
        });
    };

    const toggleOn =
        '<button class="flex-c-m colorwhite color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-30 fa fa-toggle-on m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-20">Disable Delvify AI Search</span>' +
        '</button>';

    const toggleOnSmall =
        '<button class="flex-c-m color1 color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-20 fa fa-toggle-on m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-15">Disable Delvify AI Search</span>' +
        '</button>';

    const toggleOff =
        '<button class="flex-c-m colorwhite color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-30 fa fa-toggle-off m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-20">Enable Delvify AI Search</span>' +
        '</button>';

    const toggleOffSmall =
        '<button class="flex-c-m color1 color0-hov trans-0-4 float-right" id="toggleSearchButton">' +
        '<i class="fs-20 fa fa-toggle-off m-l-3 m-r-3" aria-hidden="true" />' +
        '<span class="fs-15">Enable Delvify AI Search</span>' +
        '</button>';

    $('#searchBar').append(
        '<div class="search-product bo4 of-hidden bg-white">' +
        '<form id="searchForm" class="d-flex flex-row align-items-center">' +
        '<div class="fs-25 size6 p-l-25 p-r-25 p-t-5 p-b-5 d-none align-items-center w-size-auto" id="uploadedImageContainer">' +
        '<div class="p-1 h-100 d-flex align-items-center">' +
        '<img class="h-100 mr-2" id="uploadedImage" style="max-width: 100px;"/>' +
        '<span class="fs-15 w-size-max" id="uploadedImageName"></span>' +
        '</div> ' +
        '</div>' +
        '<div class="fs-25 size6 p-l-25 p-r-25 d-block w-100 d-flex align-items-center">' +
        '<input class="w-100" type="text" name="search-product" id="searchProduct" placeholder="Search Products..." />' +
        '</div>' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4 d-flex" type="button" id="playButton">' +
        '<i class="fs-20 fa fa-play" aria-hidden="true" />' +
        '</button>' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4 d-flex" type="button" id="stopButton">' +
        '<i class="fs-20 fa fa-stop" aria-hidden="true" />' +
        '</button>' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4 d-flex" type="button" id="recordButton">' +
        '<i class="fs-20 fa fa-microphone" aria-hidden="true" />' +
        '</button>' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4 d-flex" type="button" id="uploadButton">' +
        '<i class="fs-20 fa fa-camera" aria-hidden="true" />' +
        '</button>' +
        '<div class="flex-c-m size5 color2 trans-0-4 d-none" id="uploadSpinner">' +
        '<i class="fa fa-spinner fa-spin" aria-hidden="true" />' +
        '</div>' +
        '<button class="flex-c-m size5 color2 color0-hov trans-0-4" type="submit" id="searchButton">' +
        '<i class="fs-20 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '<input type="file" id="uploadInput" accept="image/*" hidden/>' +
        '<audio id="player" hidden></audio>' +
        '</form>' +
        '</div>'
    );

    $('#searchBarSmall').append(
        '<div class="search-product of-hidden bg-white">' +
        '<form id="searchForm" class="d-flex flex-row align-items-center">' +
        '<input class="fs-15 size4 p-l-25 p-r-25" type="text" name="search-product" id="searchProduct" placeholder="Search Products...">' +
        '<div class="fs-25 size6 p-l-25 p-r-25 p-t-5 p-b-5 d-none align-items-center" id="uploadedImageContainer">' +
        '<div class="p-1 h-100 d-flex align-items-center">' +
        '<img class="h-100 mr-2" id="uploadedImage" style="max-width: 50px;"/>' +
        '<span class="fs-10" id="uploadedImageName"></span>' +
        '</div> ' +
        '</div>' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4 d-flex" type="button" id="playButton">' +
        '<i class="fs-15 fa fa-play" aria-hidden="true" />' +
        '</button>' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4 d-flex" type="button" id="stopButton">' +
        '<i class="fs-15 fa fa-stop" aria-hidden="true" />' +
        '</button>' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4 d-flex" type="button" id="recordButton">' +
        '<i class="fs-15 fa fa-microphone" aria-hidden="true" />' +
        '</button>' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4 d-flex" type="button" id="uploadButton">' +
        '<i class="fs-15 fa fa-camera" aria-hidden="true" />' +
        '</button>' +
        '<div class="flex-c-m size5 color2 trans-0-4 d-none" id="uploadSpinner">' +
        '<i class="fa fa-spinner fa-spin" aria-hidden="true" />' +
        '</div>' +
        '<input type="file" id="uploadInput" accept="image/*" hidden/>' +
        '<audio id="player" hidden></audio>' +
        '<button class="flex-c-m size8 color2 color0-hov trans-0-4" id="searchButton">' +
        '<i class="fs-15 fa fa-search" aria-hidden="true" />' +
        '</button>' +
        '</form>' +
        '</div>'
    );

    const updateRecordButtons = () => {
        if (enabledAI) {
            switch (recordingState) {
                case 'idle':
                    $('#recordButton').removeClass('d-none').addClass('d-flex');
                    $('#playButton').removeClass('d-flex').addClass('d-none');
                    $('#stopButton').removeClass('d-flex').addClass('d-none');
                    $('#uploadSpinner').removeClass('d-flex').addClass('d-none');
                    break;
                case 'recording':
                    $('#stopButton').removeClass('d-none').addClass('d-flex');
                    $('#recordButton').removeClass('d-flex').addClass('d-none');
                    $('#playButton').removeClass('d-flex').addClass('d-none');
                    $('#uploadSpinner').removeClass('d-flex').addClass('d-none');
                    break;
                case 'stopped':
                    $('#playButton').removeClass('d-none').addClass('d-flex');
                    $('#recordButton').removeClass('d-none').addClass('d-flex');
                    $('#stopButton').removeClass('d-flex').addClass('d-none');
                    $('#uploadSpinner').removeClass('d-flex').addClass('d-none');
                    break;
                case 'loading':
                    $('#uploadSpinner').removeClass('d-none').addClass('d-flex');
                    $('#playButton').removeClass('d-none').addClass('d-flex');
                    $('#stopButton').removeClass('d-flex').addClass('d-none');
                    $('#recordButton').removeClass('d-flex').addClass('d-none');
                    break;
            }
        } else {
            $('#recordButton').removeClass('d-flex').addClass('d-none');
            $('#playButton').removeClass('d-flex').addClass('d-none');
            $('#stopButton').removeClass('d-flex').addClass('d-none');
        }
    };

    if (enabledAI) {
        $('#searchBar').append(toggleOn);
        $('#searchBarSmall').append(toggleOnSmall);
        $('#uploadButton').removeClass('d-none').addClass('d-flex');
        updateRecordButtons();
    } else {
        $('#searchBar').append(toggleOff);
        $('#searchBarSmall').append(toggleOffSmall);
        $('#uploadButton').removeClass('d-flex').addClass('d-none');
        updateRecordButtons();
    }

    $('#toggleSearchButton').on('click', function(e) {
        if ($(this).find("i").hasClass("fa-toggle-on")) {
            enabledAI = false;
            $(this).find("i").removeClass("fa-toggle-on").addClass("fa-toggle-off");
            $(this).find("span").text("Enable Delvify AI Search");
            $('#uploadButton').removeClass('d-flex').addClass('d-none');
            updateRecordButtons();
        } else {
            enabledAI = true;
            $(this).find("i").removeClass("fa-toggle-off").addClass("fa-toggle-on");
            $(this).find("span").text("Disable Delvify AI Search");
            if (!loading) {
                $('#uploadButton').removeClass('d-none').addClass('d-flex');
                updateRecordButtons();
            }
        }
    });

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchProduct').val();
        if (keyword) {
            window.location.href = "product.html?" + "ai=" + enabledAI +"&keyword=" + keyword;
        }
        return false;
    });

    $('#uploadButton').on('click', function(e) {
        e.preventDefault();
        $('#uploadInput').click();
        return false;
    });

    let AudioContext = window.AudioContext || window.webkitAudioContext;
    let recorder, stream, context, input;
    $('#recordButton').on('click', function(e) {
        e.preventDefault();
        getMicrophonePermission()
            .then(() => {
                recordingState = 'recording';
                updateRecordButtons();
                navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                    .then(function(s) {
                        stream = s;
                        context = new AudioContext({
                            sampleRate: 16000,
                        });
                        input = context.createMediaStreamSource(stream);
                        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
                        recorder = new Recorder(input, {
                            numChannels: 1
                        });
                        //start the recording process
                        recorder.record();
                    });
            })
            .catch((err) => {
                console.log(err);
            });
        return false;
    });

    $('#stopButton').on('click', function() {
        if (recorder) {
            recorder.stop(); //stop microphone access
            stream.getAudioTracks()[0].stop();
            recorder.exportWAV((data) => {
                recordingState = 'loading';
                $('#searchProduct').attr('placeholder', 'Sound recognizing...');
                updateRecordButtons();

                const file = new File([data], 'recording.wav');
                $('#player').attr('src', URL.createObjectURL(data));
                let formData = new FormData();
                formData.append('audio', file);

                let req = new XMLHttpRequest();

                req.onreadystatechange = function(e) {
                    if (req.readyState == 4 && req.status == 200) {
                        recordingState = 'stopped';
                        updateRecordButtons();
                        console.log('Sound recognized: ', req.responseText);
                        $('#searchProduct').val(req.responseText);
                        $('#searchProduct').attr('placeholder', 'Search Products...');
                    }
                };
                req.open("POST", `${process.env.API_HOST}/ai/recognize`);
                req.send(formData);
            })
        }
    });

    $('#playButton').on('click', function() {
        $('#player').trigger('play');
    });

    $('#uploadInput').on('change', function(e) {
        if ($(this).prop('files').length > 0) {
            loading = true;
            $('#uploadButton').removeClass('d-flex').addClass('d-none');
            $('#recordButton').removeClass('d-flex').addClass('d-none');
            $('#searchButton').removeClass('d-flex').addClass('d-none');
            $('#uploadSpinner').removeClass('d-none').addClass('d-flex');
            $('#searchProduct').removeClass('d-block').addClass('d-none');
            $('#uploadedImageContainer').removeClass('d-none').addClass('d-flex');
            const file = $(this).prop('files')[0];
            $('#uploadedImage').prop('src', URL.createObjectURL(file));
            $('#uploadedImageName').html(`${file.name} ‧ ${(file.size/1024).toFixed(2)}KB`);


            let reader = new FileReader();
            reader.onloadend = function() {
                sessionStorage.setItem('uploadedImage', JSON.stringify({ data: reader.result, name: file.name, size: file.size }));
                window.location.href = "product.html?" + "ai=" + enabledAI +"&searchBy=image";
            };
            reader.readAsDataURL(file);
        }
    });

});