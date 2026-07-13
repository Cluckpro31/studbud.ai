import streamlit as st
from components.sidebar import render_sidebar
from components.chat import render_chat

# ---------------- Page Config ---------------- #

st.set_page_config(
    page_title="EduNova AI",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------- Load CSS ---------------- #

def load_css():
    with open("assets/css/style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

load_css()

# ---------------- Sidebar ---------------- #

render_sidebar()

# ---------------- Main Page ---------------- #

# ---------------- Hero Section ---------------- #

st.markdown("""
# 🎓 EduNova AI

### Your Offline AI Teacher

Learn anytime, anywhere — even without internet.
""")

st.divider()

col1, col2, col3 = st.columns(3)

with col1:
    st.metric("📚 Subjects", "3")

with col2:
    st.metric("🤖 AI", "Offline")

with col3:
    st.metric("📝 Quizzes", "Unlimited")

st.divider()

render_chat()