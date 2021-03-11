<?xml version="1.0" encoding="UTF-8" ?>
<Package name="Survey" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="behavior_1" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs />
    <Resources>
        <File name="main" src="html/javascripts/main.js" />
        <File name="main.min" src="html/javascripts/main.min.js" />
        <File name="polyfill" src="html/javascripts/polyfill.js" />
        <File name="polyfill.min" src="html/javascripts/polyfill.min.js" />
        <File name="Raleway-Black" src="html/styles/fonts/Raleway-Black.ttf" />
        <File name="Raleway-Regular" src="html/styles/fonts/Raleway-Regular.ttf" />
        <File name="main" src="html/styles/main.css" />
        <File name="index" src="html/index.html" />
        <File name="icon" src="icon.png" />
        <File name="service" src="service.py" />
        <File name="" src=".gitignore" />
        <File name="README" src="README.md" />
        <File name="birthday" src="html/birthday.jpg" />
        <File name="chocolate" src="html/chocolate.jpg" />
        <File name="cookie" src="html/cookie.jpg" />
        <File name="strawberry" src="html/strawberry.jpg" />
        <File name="MarkerData_0" src="html/MarkerData_0.png" />
        <File name="MarkerData_1" src="html/MarkerData_1.png" />
        <File name="MarkerData_2" src="html/MarkerData_2.png" />
        <File name="MarkerData_3" src="html/MarkerData_3.png" />
    </Resources>
    <Topics />
    <IgnoredPaths />
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
    <service name="service" autorun="true" execStart="./python service.py" />
    <executableFiles>
        <file path="python" />
    </executableFiles>
    <qipython name="service" />
</Package>
