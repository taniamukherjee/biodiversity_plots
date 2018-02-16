# import necessary libraries
import pandas as pd
import numpy as np
from flask import (
    Flask,
    render_template,
    jsonify,
    request)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

print("pt1")
#################################################
# Data is fetched from csv files to Pandas dataframes
#################################################

#fetch data - csv + pandas or sqlite - chose to use csv + pandas
# read in csv file in dataframe
metadata_df = pd.read_csv("./DataSets/Belly_Button_Biodiversity_Metadata.csv", index_col=None)

# find columns with all null values if any.
null_cols = metadata_df.columns[metadata_df.isnull().all()].tolist() 

# delete columns with all null values
metadata_df = metadata_df.drop(null_cols, 1)  # axis = 1

# Replace NaN values with 0s, as replacing with 0s won't hurt the results.
metadata_df = metadata_df.fillna(0)

# extract required column as a list  
sample_IDs = metadata_df['SAMPLEID'].tolist()


# @app.before_first_request
# def setup():
#     # Recreate database each time for demo
#     db.drop_all()
#     db.create_all()
#     print("pt4")


#################################################
# Routes
#################################################

@app.route("/")
# Returns the dashboard homepage.
def home():
    return "Welcome!"

@app.route('/names')
# List of sample names.
    # Returns a list of sample names in the format
    # [
    #     "BB_940",
    #     "BB_941",
    #     "BB_943",
    #     "BB_944",
    #     "BB_945",
    #     "BB_946",
    #     "BB_947",
    #     ...
    # ]
def samp_names():
    # add required prefix to each item in the list
    # sample_IDs = metadata_df['SAMPLEID'].tolist()
    sample_names = ["BB_" + str(s) for s in sample_IDs] # sample_IDs defined above routes
    return(jsonify(sample_names))

@app.route('/otu')
    # List of OTU descriptions.

    # Returns a list of OTU descriptions in the following format

    # [
    #     "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
    #     "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
    #     "Bacteria",
    #     "Bacteria",
    #     "Bacteria",
    #     ...
    # ]

def otu_describe():
    # read in csv file in dataframe
    otu_df = pd.read_csv("./DataSets/belly_button_biodiversity_otu_id.csv")
    otu_df = otu_df.dropna(axis=0, thresh=1)  

    # extract required column by index only as there is no column heading
    otu_descriptions = otu_df.iloc[:, 1].values.tolist()
    return(jsonify(otu_descriptions))

@app.route('/metadata/<sample>')
    # MetaData for a given sample.
    # Args: Sample in the format: `BB_940`
    # Returns a json dictionary of sample metadata in the format
    # {
    #     AGE: 24,
    #     BBTYPE: "I",
    #     ETHNICITY: "Caucasian",
    #     GENDER: "F",
    #     LOCATION: "Beaufort/NC",
    #     SAMPLEID: 940
    # }

def samplefunction(sample):
    # e.g. from sample argument `BB_940`, only 940 is extracted below
    sample_id = int(sample[3:])
    # single row df created below
    row_df = metadata_df.loc[metadata_df['SAMPLEID'] == sample_id]
    # df with needed columns
    sample_df = row_df[['AGE','BBTYPE','ETHNICITY','GENDER','LOCATION','SAMPLEID']]
    # 'records' arg creates dict in required format
    sample_dict = sample_df.to_dict('records')
    return(jsonify(sample_dict))

@app.route('/wfreq/<sample>')
    # Weekly Washing Frequency as a number.

    # Args: Sample in the format: `BB_940`

    # Returns an integer value for the weekly washing frequency `WFREQ`

def wash_freq(sample):
    # e.g. from sample argument `BB_940`, only 940 is extracted below
    sample_id = int(sample[3:])
    # single row df created below
    row_df = metadata_df.loc[metadata_df['SAMPLEID'] == sample_id] 
    print("pt1")
    # df with needed columns
    WFREQ = int(row_df.iloc[0]['WFREQ'])
    print("pt2")
    return(jsonify(WFREQ))


@app.route('/samples/<sample>')
    # OTU IDs and Sample Values for a given sample.

    # Sort your Pandas DataFrame (OTU ID and Sample Value)
    # in Descending Order by Sample Value

    # Return a list of dictionaries containing sorted lists  for `otu_ids`
    # and `sample_values`

    # [
    #     {
    #         otu_ids: [
    #             1166,
    #             2858,
    #             481,
    #             ...
    #         ],
    #         sample_values: [
    #             163,
    #             126,
    #             113,
    #             ...
    #         ]
    #     }
    # ]
def ids_values(sample):
    samples_df = pd.read_csv("./DataSets/belly_button_biodiversity_samples.csv", index_col=None)
    # fill NaNs with 0's
    samples_df = samples_df.fillna(0)  
    # get the 2 required columns; one is passed sample in function arg.
    id_values_df = samples_df[['otu_id', sample]].copy()
    values_descend_df = id_values_df.sort_values(sample, ascending=False)
    values_descend_df[sample] = values_descend_df[sample].astype(int) # convert sample column values to 'int's
    values_descend_df.columns = ['otu_id', 'sample_values'] # rename columns as per instruction
    values_descend_dict = values_descend_df.to_dict('list') # convert to dict in required form
    values_descend_list = [] # create list 
    values_descend_list.append(values_descend_dict.copy())
    return(jsonify(values_descend_list))

if __name__ == "__main__":
    app.run()