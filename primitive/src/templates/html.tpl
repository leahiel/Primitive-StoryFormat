<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <title>{{STORY_NAME}}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <!-- TODO: Add Copyright and License here. -->
    <script id="script-libraries" type="text/javascript">
        if (document.head && document.addEventListener && document.querySelector && Object.create && Object.freeze &&
            JSON) {
            document.documentElement.setAttribute("data-init", "loading");
            '{{BUILD_LIB_SOURCE}}'
        } else {
            document.documentElement.setAttribute("data-init", "lacking");
        }
    </script>
    '{{BUILD_CSS_SOURCE}}'
</head>

<body>
    <div id="init-screen">
        <div id="init-no-js"><noscript>JavaScript must be enabled to play.</noscript></div>
        <div id="init-lacking">
            <p>Browser lacks capabilities required to play.</p>
            <p>Upgrade or switch to another browser.</p>
        </div>
        <div id="init-loading">
            <div>Loading&hellip;</div>
        </div>
    </div>
    {{STORY_DATA}}
    <script id="script-sugarcube" type="text/javascript">
        /*! SugarCube JS */
        if (document.documentElement.getAttribute("data-init") === "loading") {
            '{{BUILD_APP_SOURCE}}'
        }
    </script>
</body>

</html>