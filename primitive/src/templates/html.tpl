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
            console.log("Libraries built successfully.");
        } else {
            document.documentElement.setAttribute("data-init", "lacking");
        }
    </script>
    '{{BUILD_CSS_SOURCE}}'
    <script type="text/javascript">
        console.log("CSS built successfully.");
    </script>
</head>

<body>
    <div id="init-screen">
        <div id="init-no-js"><noscript>JavaScript must be enabled to use the Primitive StoryFormat.</noscript></div>
        <div id="init-lacking">
            <p>Browser lacks capabilities required to play.</p>
            <p>Upgrade or switch to another browser.</p>
        </div>
        <div id="init-loading">
            <div>Loading&hellip;</div>
        </div>
    </div>
    {{STORY_DATA}}
    <script id="script-primitive" type="text/javascript">
        /*! Primitive JS */
        if (document.documentElement.getAttribute("data-init") === "loading") {
            '{{BUILD_APP_SOURCE}}'
            console.log("JavaScript App built successfully.");
            document.documentElement.removeAttribute("data-init");
        }
    </script>

    <div id='wrapper'>
        <div id='primitive-header'>
            <div id='primitive-title'>Primitive</div>
            <button id='primitive-test-html' class='primitive-button'>
                Test HTML
            </button>
        </div>

        <div id='error-notices'></div>
        <div id='warning-notices'></div>

        <div id='output'></div>
        <div id='primitive-footer'>
            <div id='primitive-version-number'>
                Built with Primitive v"{{BUILD_VERSION_VERSION}}"."{{BUILD_VERSION_BUILD}}"
            </div>
        </div>
    </div>

    

</body>

</html>