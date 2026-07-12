import streamlit as st

def render_chat():
    st.markdown("## 💬 Chat")

    # User message
    st.chat_message("user").write("Why do plants need sunlight?")

    # AI message
    st.chat_message("assistant").write(
        """
Plants need sunlight because they use it to make their own food through a process called **photosynthesis**.

### 🌱 Quick Actions
"""
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.button("✨ Explain Like I'm 10", use_container_width=True)

    with col2:
        st.button("📝 Quiz Me", use_container_width=True)

    with col3:
        st.button("📚 NCERT Source", use_container_width=True)