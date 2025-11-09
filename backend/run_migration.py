import os
import sys
from alembic.config import Config
from alembic import command

def run_migrations():
    # Get the directory where this script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set up the Alembic configuration
    config = Config(os.path.join(base_dir, 'alembic.ini'))
    
    # Set the script location
    config.set_main_option('script_location', os.path.join(base_dir, 'alembic'))
    
    # Run the migration
    command.revision(config, autogenerate=True, message="Add maintenance tables")
    
    # Apply the migration
    command.upgrade(config, 'head')

if __name__ == '__main__':
    run_migrations()
