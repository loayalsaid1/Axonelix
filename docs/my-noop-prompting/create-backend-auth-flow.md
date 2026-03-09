# Auth Backend flow
Context: Currently, and as per the Revised App Summary.md document describing teh scope of the app.. 
Currently, we have the materials, questions linked to it, and old exams, but to trails for users.
we are using clerk for auth and currently, it's just limited to front-end. and we currently, want to setup users in backend so that we can track their data, generate quizzez later and so on. 

## (initially), general plan or steps
- generate a user's table with id, clerk id, email, role .. so far so good
- create a web hook in auth module that recieves user(created, update, or deleted) events and add an entry to the user table
- create a guard to extract the user and networklessly validate the user from the token(via teh secrent key instead of making a network request to validate teh token for each single request to backend) and then get the user data from teh DB (or cache later) by hat clerk Id there
- Not now, but make an auth gaurd and a decorator for authorization!
- probably make a fallback function so if the webhook somehow didn't work and we have a valid clerk auth token, but no user in our lovely database exists


after user is setup, we are ready to implement quizzez functionality 
