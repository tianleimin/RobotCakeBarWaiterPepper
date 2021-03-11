# Overview

This Choregraphe (v2.5) project makes use of HTML/Javascript to implement an order-taking behavior for the Pepper robot, as part of the HRI group robot hackathon event. 

During interaction, Pepper will introduce how the robot cake bar works, and a customer can order cakes by interacting with the menu on Pepper's tablet. The order will then be passed on to the Fetch robot in the format of an ARUCO marker. After the customer is served, a feedback form will appear on Pepper's tablet and the customer's responses will be saved in Pepper's memory, together with a timestamp and their order.

To install this package on a Pepper robot, open the [Survey.pml](Survey.pml) file in Choregraphe. Then use the upload to robot feature to send the package to the robot. This will add a launcher entry on the tablet of the robot which when selected will start the behavior.

This project was developed based on the [Pepper Tablet Survey tool](https://github.com/tianleimin/PepperTabletSurvey).