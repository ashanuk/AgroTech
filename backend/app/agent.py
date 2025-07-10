from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph_supervisor import create_supervisor
from langgraph.prebuilt import create_react_agent

from app.utils import add, multiply, search_ddgo, get_weather, predict_weather_for_date,get_suitable_crops_only

model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key="AIzaSyCS-sWncoWhnh9cI0HdRQc56zQ35E0kgUM",
    temperature=0.7
)


math_agent = create_react_agent(
    model = model,
    tools = [add,multiply],
    name='math_expert',
    prompt= 'you are a math expert. Always usee one tool at aa time'
)

research_agent= create_react_agent(
    model = model,
    tools = [search_ddgo],
    name='search_expert',
    prompt= 'you are a world class reasearcher with access to web search.Do not do any math'
)

weather_agent= create_react_agent(
    model = model,
    tools = [get_weather],
    name='weather_expert',
    prompt= '''You are a world-class weather researcher with access to real-time weather data through web services. Your job is to provide accurate, concise, and up-to-date weather reports for any location requested. Do not perform any calculations or estimates manually. Just retrieve and present verified information.

- Use plain language that is easy for anyone to understand.
- Always mention temperature, humidity, wind speed, and general weather conditions.
- If the city is not found or there’s an error, politely explain that the data is unavailable.
- Keep your response factual and avoid unnecessary elaboration.
'''
)

weather_future_agent = create_react_agent(
    model = model,
    tools = [predict_weather_for_date],
    name='weather_future_agent',
    prompt= "Get a 5-day weather forecast summary for a city in Sri Lanka. Input should be a city name and date in YYYY-MM-DD format. use this for get present data"
)

crop_expert = create_react_agent(
    model = model,
    tools = [get_suitable_crops_only],
    name='crop_expert', 
    prompt= 'you are a crop expert. Use this tool to get suitable crops for a given location. '

)


work_flow = create_supervisor(
    [research_agent,math_agent,weather_agent,weather_future_agent,crop_expert],
    model=model,
    prompt=(
        'You are a team supervisor managing a reasearch expert and a math eapert.'
        'For current events, use research_agent. '
        'For math problems , use math_agent.'
        'For weather problems, use weather_agent.'
        'For weather problems if future in 5 days, use weather_future_tool.'
        'For crop recommendations, use crop_expert.'
    )
)


# Chat loop
chat_history = []

chat_app = work_flow.compile()


# while True:
#     user_input = input("User: ")

#     if user_input.lower() in ["exit", "quit"]:
#         break

#     result = app.invoke({
#         "messages": chat_history + [{"role": "user", "content": user_input}]
#     })

#     # Extend chat history with LangChain message objects
#     chat_history.extend(result["messages"])

#     # Print assistant reply (check message type safely)
#     for m in result["messages"]:
#         if m.type == "ai":  # equivalent to role == "assistant"
#             print("Bot:", m.content)
