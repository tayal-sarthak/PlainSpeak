# plainspeak - 2025 Congressional App Challenge Submission

plainspeak is a beautifully designed full-stack web application that is tailored to make complex text accessible for everyone. the application can simplify any text, use optical character recognition to analyze any image for simplification on text, provide checklists for appointments to different places across michigan, provide complex examples to test the plainspeak model, saves your history consistently, and supports eight different languages and four different customizations of reading levels that alter the algorithm and the output. moreover, consistent feedback loops are employed in order to persistently improve the app.

I landed at this idea in a few different ways:
1. Terms of Service is difficult for the average reader. Especially since Amazon has 196 million American users, many millions of users do not know what they are agreeing to. (citation - https://cirpamazon.substack.com/p/new-us-amazon-prime-estimate-still), 
2. 130 million americans struggle to read above a 6th grade reading level, while documents that dictate our lives are written at a 14th grade level (citation - https://www.nu.edu/blog/49-adult-literacy-statistics-and-facts/#:~:text=About%20130%20million%20U.S.%20adults,below%20a%20fifth%2Dgrade%20level.) , (https://www.apmresearchlab.org/10x-adult-literacy)
3. Immigrants who do not know english do not only have trouble understanding text but also the redundancy of important documents. This app works to take english text, make it simpler to read, and then translate it to the original text for the reader.

## how to run

1. make sure you have python 3 and node.js installed
2. install tesseract ocr on your system
3. run the app:
   ```
   python start_web.py
   ```
4. open your browser to http://localhost:3000

## what you can do

- simplify complex text to different reading levels (elementary, middle school, high school, college)
- upload images with text and get simplified versions
- translate simplified text to 8 different languages
- get action items and checklists extracted from documents
- view your simplification history
- test the app with pre-loaded complex examples like terms of service

## tech used

- backend: python, flask
- frontend: react, typescript
- ocr: tesseract
- translation: google translate
