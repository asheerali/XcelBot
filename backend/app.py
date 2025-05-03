import streamlit as st
import pandas as pd
from st_aggrid import AgGrid, GridOptionsBuilder, GridUpdateMode

st.title("Excel Data Viewer with Pagination & Filters")

# Upload the Excel file
uploaded_file = st.file_uploader("Upload an Excel file", type=["xlsx"])

if uploaded_file:
    # Read the first sheet
    df = pd.read_excel(uploaded_file, sheet_name=0)
    df.columns = df.columns.str.strip()  # Clean up column names

    st.subheader("Interactive Table with Pagination + Filters")

    # Set up AgGrid with pagination and filtering
    gb = GridOptionsBuilder.from_dataframe(df)
    gb.configure_pagination(paginationAutoPageSize=False, paginationPageSize=20)
    gb.configure_default_column(filter=True, sortable=True, resizable=True)

    # OPTIONAL: if you want to make 'Category' a set filter (multi-select inside grid)
    if 'Category' in df.columns:
        gb.configure_column(
            'Category',
            filter='agSetColumnFilter',  # Multi-select dropdown in AgGrid
            headerCheckboxSelection=True,
            headerCheckboxSelectionFilteredOnly=True
        )

    gridOptions = gb.build()

    grid_response = AgGrid(
        df,
        gridOptions=gridOptions,
        height=500,
        update_mode=GridUpdateMode.MODEL_CHANGED,  # <== THIS is important!
        enable_enterprise_modules=True,            # <== Set to True for set filter
        theme="light",
        allow_unsafe_jscode=True,
    )

    # Get the filtered data back from AgGrid
    filtered_df = pd.DataFrame(grid_response['data'])

    # --- Show Graphs based on AgGrid filter ---
    st.subheader("Charts (Based on Table Filter)")

    col1, col2 = st.columns(2)

    with col1:
        st.write("### Net Price vs Qty (Scatter Plot)")
        if 'Net Price' in filtered_df.columns and 'Qty' in filtered_df.columns:
            st.scatter_chart(filtered_df[['Net Price', 'Qty']])
        else:
            st.warning("Columns 'Net Price' and 'Qty' not found.")

    with col2:
        st.write("### Bar Chart of Net Price")
        if 'Net Price' in filtered_df.columns:
            st.bar_chart(filtered_df['Net Price'])
        else:
            st.warning("'Net Price' column not found.")
else:
    st.info("Please upload an Excel (.xlsx) file to begin.")
