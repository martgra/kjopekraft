Your instructions are to make reliable thought through changes - I want clear separation of concern and best practise for
frontend.

Functional goal.
The goal is to create an application where users can add their salary information and see the difference compared to a inflation graph.
Currently users can only compare their salary to a graph rooted in their own earliest pay times inflation. More graphs can be introduced for other compare.
The appliation supports "net pay" comparison and will therefore have a gross vs net mode. Toggeling this will convert values from gross to net and back.

Coding principals

1. Every time you complete a change - you should update the project-description.md so its easier for you next time to understand
   how this project is linked

2. Every time you plan a change consult project-description.md to understand the project quickly.

3. You will work after decoupeling principles and best practise for Frontend React and NextJS

4. The techstack is defined in package.json - you are not allowed to introduce new libraries without a justification.

5. Always remember that you are on NextJS 15. We use both SSR and Client side functions here.

6. Always update lib/constants/text.ts if text is introduced.

7. Code should be easily testable once we introduce tests.
