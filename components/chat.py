import streamlit as st
from utils.llm import ask_ai


def render_chat():

    st.markdown("## 💬 Chat with Nova")

    # Chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display previous messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # User input
    if prompt := st.chat_input("Ask Nova anything from NCERT..."):

        # Show user message
        st.session_state.messages.append(
            {"role": "user", "content": prompt}
        )

        with st.chat_message("user"):
            st.markdown(prompt)

        # Generate AI response
        with st.chat_message("assistant"):

            with st.spinner("🌸 Nova is thinking..."):

                answer = ask_ai(prompt)

                st.markdown(answer)

                st.session_state.messages.append(
                    {
                        "role": "assistant",
                        "content": answer
                    }
                )

                st.divider()

                col1, col2, col3 = st.columns(3)

                with col1:
                    st.button(
                        "✨ Explain Like I'm 10",
                        disabled=True,
                        use_container_width=True
                    )

                with col2:
                    st.button(
                        "📝 Quiz Me",
                        disabled=True,
                        use_container_width=True
                    )

                with col3:
                    st.button(
                        "📚 NCERT Source",
                        disabled=True,
                        use_container_width=True
                    )

            if st.button("📝 Quiz Me"):
                quiz = generate_quiz(prompt, context)
                st.markdown(quiz)

            if st.button("🧠 Flashcards"):
                cards = generate_flashcards(prompt, context)
                st.markdown(cards)