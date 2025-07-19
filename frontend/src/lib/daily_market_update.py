import requests
from bs4 import BeautifulSoup
import re
from pymongo import MongoClient
import pdfplumber
from datetime import datetime
import os
import tempfile
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def get_latest_pdf_url():
    base = "https://www.cbsl.gov.lk"
    url = base + "/en/statistics/economic-indicators/price-report"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")

    links = []
    for a in soup.find_all("a", href=True):
        match = re.search(r'price_report_(\d{8})_e\.pdf', a["href"])
        if match:
            href = a["href"]
            # Check if href is already a full URL or a relative path
            if href.startswith("http"):
                full_url = href
            else:
                full_url = base + href
            links.append((match.group(1), full_url))

    if not links:
        raise ValueError("No price_report PDF links found")

    latest_date, latest_url = max(links, key=lambda x: x[0])
    return latest_date, latest_url



def download_pdf(url, out_path):
    resp = requests.get(url)
    with open(out_path, "wb") as f:
        f.write(resp.content)




def extract_marketwise_prices(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"

    pattern = re.compile(r"^(.*?)\s+Rs\./(kg|Each|Nut|Ltr)\s+(.*?)$", re.MULTILINE)
    matches = pattern.findall(text)

    market_columns = {
        "Pettah": 1,
        "Dambulla": 3,
        "Narahenpita": 5
    }

    agrotech= {
        market: {
            "market": market,
            "date": "2025-07-18",
            "items": []
        } for market in market_columns
    }

    for item_name, unit, price_block in matches:
        prices = re.findall(r"[\d,\.]+|n\.a\.", price_block)
        prices = [p.replace(",", "") for p in prices]

        for market, col_index in market_columns.items():
            if col_index < len(prices):
                price_str = prices[col_index].strip()
                # Skip if price is 'n.a.' or empty or contains non-numeric characters
                if price_str.lower() != "n.a." and price_str and re.match(r'^[\d\.]+$', price_str):
                    try:
                        price_value = float(price_str)
                        agrotech[market]["items"].append({
                            "name": item_name.strip(),
                            "unit": unit,
                            "price": price_value
                        })
                    except ValueError:
                        # Skip prices that can't be converted to float
                        continue

    return list(agrotech.values())



def update_market_collection(marketwise_data):
    # Get MongoDB URI from environment variable
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db = client["agrotech"]
    col = db["markets"]

    for record in marketwise_data:
        col.update_one(
            {"market": record["market"], "date": record["date"]},
            {"$set": record},
            upsert=True
        )


def format_date(date_string):
    """Convert date string from YYYYMMDD to YYYY-MM-DD format"""
    try:
        date_obj = datetime.strptime(date_string, "%Y%m%d")
        return date_obj.strftime("%Y-%m-%d")
    except ValueError:
        return datetime.now().strftime("%Y-%m-%d")


def main():
    """
    Main function to orchestrate the entire market data update process
    """
    try:
        print("🚀 Starting market data update process...")
        
        # Step 1: Get the latest PDF URL
        print("📡 Fetching latest price report URL...")
        latest_date, latest_url = get_latest_pdf_url()
        formatted_date = format_date(latest_date)
        print(f"✅ Found latest report: {latest_date} ({formatted_date})")
        print(f"🔗 URL: {latest_url}")
        
        # Step 2: Download the PDF to a temporary file
        print("⬇️  Downloading PDF file...")
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_pdf_path = temp_file.name
            download_pdf(latest_url, temp_pdf_path)
            print(f"✅ PDF downloaded to: {temp_pdf_path}")
        
        # Step 3: Extract market data from PDF
        print("📊 Extracting market data from PDF...")
        marketwise_data = extract_marketwise_prices(temp_pdf_path)
        
        # Update dates in the extracted data
        for agrotech in marketwise_data:
            agrotech["date"] = formatted_date
        
        total_items = sum(len(market["items"]) for market in marketwise_data)
        print(f"✅ Extracted data for {len(marketwise_data)} markets with {total_items} total items")
        
        # Print summary of extracted data
        for market in marketwise_data:
            print(f"   📍 {market['market']}: {len(market['items'])} items")
        
        # Step 4: Update MongoDB collection
        print("💾 Updating MongoDB collection...")
        update_market_collection(marketwise_data)
        print("✅ Market data successfully updated in MongoDB!")
        
        # Step 5: Clean up temporary file
        os.unlink(temp_pdf_path)
        print("🧹 Temporary files cleaned up")
        
        print("🎉 Market data update process completed successfully!")
        
        return {
            "success": True,
            "date": formatted_date,
            "markets": len(marketwise_data),
            "total_items": total_items,
            "message": "Market data updated successfully"
        }
        
    except Exception as e:
        print(f"❌ Error during market data update: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to update market data"
        }


def update_market_data_scheduled():
    """
    Wrapper function for scheduled execution (can be used with cron jobs)
    """
    result = main()
    
    if result["success"]:
        print(f"Scheduled update completed: {result['message']}")
    else:
        print(f"Scheduled update failed: {result['message']}")
        # You could add logging or notification logic here
    
    return result


def get_market_summary():
    """
    Function to get a summary of the current market data in MongoDB
    """
    try:
        # Get MongoDB URI from environment variable
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        client = MongoClient(mongo_uri)
        db = client["agrotech"]
        col = db["markets"]
        
        # Get all market records
        markets = list(col.find())
        
        if not markets:
            return {"message": "No market data found in database"}
        
        # Group by date to get latest data
        latest_date = max(market["date"] for market in markets)
        latest_markets = [m for m in markets if m["date"] == latest_date]
        
        summary = {
            "latest_date": latest_date,
            "markets": []
        }
        
        for market in latest_markets:
            summary["markets"].append({
                "name": market["market"],
                "items_count": len(market["items"]),
                "sample_items": market["items"][:3]  # Show first 3 items as sample
            })
        
        return summary
        
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    # Run the main function when script is executed directly
    main()

