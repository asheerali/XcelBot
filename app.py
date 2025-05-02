import streamlit as st
import pandas as pd
import numpy as np

st.title("Data and Charts")

# Prepare data
df = pd.DataFrame({
    'A': np.random.randn(50),
    'B': np.random.randn(50),
    'C': np.random.randn(50),
    'D': np.random.randn(50),
    'E': np.random.randn(50),
    'F': np.random.randn(50),
    'G': np.random.randn(50),
    
})

# Row 1: Table and Graph
st.subheader("Row 1")

col11, col12 = st.columns(2)

with col11:
    st.write("### Table (1,1)")
    st.write(df)

with col12:
    st.write("### Graph (1,2)")
    st.line_chart(df)

# Row 2: Two Graphs
st.subheader("Row 2")

col21, col22 = st.columns(2)

with col21:
    st.write("### Graph (2,1)")
    st.bar_chart(df)

with col22:
    st.write("### Graph (2,2)")
    st.line_chart(df)
