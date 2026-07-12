import streamlit as st

def render_sidebar():
    with st.sidebar:
        st.markdown("# 🎓 EduNova AI")
        st.caption("Your Offline AI Teacher")

        st.divider()

        if st.button("➕ New Chat", use_container_width=True):
            pass

        st.markdown("### 📚 Subjects")

        st.button("🧮 Maths", use_container_width=True)
        st.button("🧪 Science", use_container_width=True)
        st.button("📖 English", use_container_width=True)

        st.divider()

        st.markdown("### 💬 Recent Chats")

        st.info("No chats yet.")