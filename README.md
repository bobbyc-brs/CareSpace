For the AI Tinkerers - Ottawa (https://ottawa.aitinkerers.org/) *2025 "E𝗵 𝗜" Summer Vibe Hackathon* (https://vibe-coding-hackathon.devpost.com/), a group of people who are passionate about AI and machine learning and helping the healthcare industry got together and brought to life a Smart Booking Agent for CHEO.

Big shoutout to the team:
* Kathleen Melanson,
* Raviraj Mangukiya
* Kyle Groh, 
* Vincent Hartung, 
* Eugenia Kondratova, 
* Shahla Ahmed, 
* Isabelle Wang & 
* Bobby Chawla

**## Repository Structure**

The main CareSpace app and all associated documentation can be found in the [`carespace-app`](./carespace-app/) subdirectory.

For setup and usage instructions, see carespace-app/README.md

**## Inspiration**  
The inspiration for this project comes from a conversation with the VP of Strategy, and CIO at CHEO. She raised concerns about insufficient space utilization in the hospital. With the increase in remote work amongst doctors, a phenomenon has emerged where many hospital spaces like offices, labs, meeting rooms, and research rooms, are left vacant during the hospital operating hours. Simultaneously there are not enough ‘available spaces’  to take on more patient consultations, and perform other important work. “ \[Right now\] no-one knows where to go for anything. It’s like a dog’s breakfast”. The issue here is not a lack of space, it is a lack of organization of the available space. The CIO estimates that on a given day, roughly 75% of available spaces are booked, and of that percentage, only 75% of those spaces are actually used, resulting in a 56% utilization rate which is not ideal for any space; especially not in a children’s hospital.

**## What it does**  
Our project optimizes the available physical space that is currently at CHEO. Our AI agent takes data about every room in the hospital, and whether or not it can be booked for medical purposes. For example when Dr Wolf is taking virtual consultations at home, Dr Hawk can use Dr Wolf’s office to take on a new patient consultation while his office is being used by NP Falcon who is tending to a different patient. Our agent takes in information from hospital employees’ work calendars, identifying patterns about their preferred meeting times, preferred meeting rooms and other correlations about other related work behaviours.

**## How it works:** Doctors, nurses, and administrators log into our platform and interact with the agent who asks them their required tasks for the day and where and when they want to work from (remote or at the hospital). Depending on the needs of the user, they are given a room at the hospital that is relevant to their tasks for that day. This ensures that the hospital's available spaces are visible to everyone, and actually available to be used. The system pivots on the goodwill of the hospital employees, as they are willingly giving up their dedicated space(s) when they are not in person at the hospital; all for the goal of collectively seeing and caring for more patients. It creates an honour system amongst the employees who have to care for and respect each other's spaces, thus creating a closer and an even more mission-driven environment. 

**## How we built it**  
Because our project relies on confidential data, we built x main artifacts:

1. To simulate real-world conditions, we firstly designed a hospital that had a random (but relevant) layout, with types of relevant rooms and the quantity of each room using ChatGPT.

2. Next we determined which rooms were appropriate for the different specialties and practices and created a randomly distributed calendar where each room was booked at various hours and days over a two-week period using Gemini, Windsurf & Claude. This is our independent variable.  
     
3. Next we designed 10 doctor profiles each with their own calendar using Claude over the same future two-week period and all of their appointments. 

4. Here we built a chat interface to follow the defined flow for each booking request.  This chatbot passes and receives information from the hospital layout, and the corresponding calendars. We used Cursor, Windsurf, OpenAI, ChatGPT and Perplexity. 

5. AI agent to check calendars and find relevant open spaces that are available then and shows a table of available rooms at present using OpenAI model.

   

6. Then the user selects an option that is convenient for them and the calendar updates the space booking data.

**## Challenges we ran into**

1. No access to CHEO’s real data: Ideally, our bot would access the doctors and space data from the CHEO server. Since we did not have access to the CHEO’s data sources, we created our own datasets for the tasks.   
2. Physician data, like working hours, specialties, hospital space options suitable for each specialization, are all not readily available and had to be generated through prompts.  
3. Time limitation: We hosted our project in localhost instead of hosting on the web.  
4. Own Website: As we did not have any access to CHEO’s website for our chatbot, we made our own website for the bot.

**## Accomplishments that we're proud of**  
We managed to successfully create a simple realistic simulation of a hospital, complete with schedules for rooms, and schedules that respective employees would have.

Using Windsurf, we managed to create a google calendar with all our simulated room booking data. And we used OpenAI to select the best booking option for each medical professional. 

We were able to generate realistic data for Pediatric Medical Professionals including their work schedules and types of activities using Claude.

Using Tailwind, we built an intuitive UI that hosts our AI agent, and calls on the data from our Room google calendar, as well as the calendars of employees.

All of our code was Vibecoded with Cursor and Windsurf. 

**## What we learned**  
Our AI agent edited 10,352 lines of code

We learned how to come at a problem with various perspectives and expertise

All of our non-technical (and technical) members learned how to properly use **Windsurf** to build various aspects of our artifacts

**## What's next for CareSpace**  
Next, CareSpace is heading back to CHEO where we are looking to iterate with the Chief Innovation Officer who inspired the project in the first place. Our end goal is to find space for doctors to do their work, and ultimately to help increase CHEO’s capacity for life-saving care for children. 

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
   Thanks
   
