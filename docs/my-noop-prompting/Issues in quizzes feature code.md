## 1. generating quizes questions logic
The generate logic is making a bunch of sequensial fetches and fetchign so many data then passing it to next queries, and also handling thigns like randomizing in the code, 
I suggest we keep this in one query and build it similer to the #file:questions.service.ts , and may utilize it's helpers and eithe make them public and using them for buildign hierarchy side of the query and builder a similer for user filters and the others, or maybe rebuilding them here from scratch and making the fetching and randomizing much more effecient.

## 2. gaurding against unauthorazed users 
gaurding aginst non-owner users or quizzes and quiz sessions  can be outside in a seprate quizzes gaurd when stoping access to either quiz or quiz session is needed. however we will detect this is quiz or quizsession or may be do 2 gaurds? whatever more appropriate

## 3. Deleting logic
I'm not sure, but in deleting functions .. just use one delete statement with returning, and check if returned value is not there then it's not found, 

## 4. filtering for unread questions
when filtering for unread, how about searchign for entries not in the view, instead of getting what' in, and then building a set, and then checking if it has or not.. .. 
this is if the query won't cover that already

## 5. the views in the 0004_quiz_tirggers_and_views, 
can't then be build and referenced using drizzle? instead?
